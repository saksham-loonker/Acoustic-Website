alter table acoustic_beta.windows_beta_access
  add column device_hashes bytea[] not null default '{}',
  add constraint windows_beta_device_limit check (cardinality(device_hashes) <= 3);

create function acoustic_beta.register_device(activation_code text, device_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  entitlement acoustic_beta.windows_beta_access%rowtype;
  registration bytea;
  checked_at timestamptz;
begin
  if activation_code is null or activation_code !~ '^[0-9a-f]{48}$'
     or device_hash is null or device_hash !~ '^[0-9a-f]{64}$' then
    return '{"status":"invalid"}'::jsonb;
  end if;
  registration := decode(device_hash, 'hex');

  select * into entitlement
    from acoustic_beta.windows_beta_access
    where code_hash = extensions.digest(activation_code, 'sha256')
    for update;
  if not found then return '{"status":"invalid"}'::jsonb; end if;

  checked_at := clock_timestamp();
  if entitlement.ends_at <= checked_at then
    return jsonb_build_object('status', 'ended', 'serverTime', checked_at, 'endsAt', entitlement.ends_at);
  end if;
  if not (registration = any(entitlement.device_hashes)) then
    if cardinality(entitlement.device_hashes) >= 3 then return '{"status":"device_limit"}'::jsonb; end if;
    update acoustic_beta.windows_beta_access
      set device_hashes = array_append(device_hashes, registration)
      where email = entitlement.email;
  end if;
  return jsonb_build_object('status', 'active', 'serverTime', checked_at, 'endsAt', entitlement.ends_at);
end
$$;

create function public.register_windows_beta_device(activation_code text, device_hash text)
returns jsonb language sql set search_path = '' as $$
  select acoustic_beta.register_device(activation_code, device_hash);
$$;

create function public.find_windows_beta_code_owner(activation_code text)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('email', email, 'devices', cardinality(device_hashes), 'endsAt', ends_at)
  from acoustic_beta.windows_beta_access
  where activation_code ~ '^[0-9a-f]{48}$'
    and code_hash = extensions.digest(activation_code, 'sha256');
$$;

create function public.reset_windows_beta_devices(tester_email text)
returns boolean language sql set search_path = '' as $$
  with cleared as (
    update acoustic_beta.windows_beta_access set device_hashes = '{}'
      where email = lower(btrim(tester_email)) returning 1
  )
  select exists (select 1 from cleared);
$$;

create or replace function public.issue_windows_beta_code(tester_email text)
returns text language plpgsql set search_path = '' as $$
declare
  address text := lower(btrim(tester_email));
  code text := encode(extensions.gen_random_bytes(24), 'hex');
begin
  if not exists (select 1 from public.beta_mailing_list where email = address) then
    raise exception 'This email is not on the beta mailing list';
  end if;
  insert into acoustic_beta.windows_beta_access (email, code_hash)
    values (address, extensions.digest(code, 'sha256'))
    on conflict (email) do update set code_hash = excluded.code_hash, device_hashes = '{}';
  return code;
end
$$;

revoke all on function acoustic_beta.register_device(text, text) from public, anon, authenticated, service_role;
revoke all on function public.register_windows_beta_device(text, text) from public, anon, authenticated, service_role;
grant execute on function acoustic_beta.register_device(text, text), public.register_windows_beta_device(text, text) to anon;
revoke all on function public.find_windows_beta_code_owner(text), public.reset_windows_beta_devices(text),
  public.issue_windows_beta_code(text) from public, anon, authenticated, service_role;
grant execute on function public.check_windows_beta_access(text), acoustic_beta.lookup_access(text) to service_role;
