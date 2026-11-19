create extension if not exists pgcrypto with schema extensions;

create schema acoustic_beta;
revoke all on schema acoustic_beta from public, anon, authenticated;
grant usage on schema acoustic_beta to anon;

create table acoustic_beta.windows_beta_access (
  email text primary key references public.beta_mailing_list(email) on delete cascade,
  code_hash bytea not null unique,
  ends_at timestamptz
);

alter table acoustic_beta.windows_beta_access enable row level security;
revoke all on acoustic_beta.windows_beta_access from public, anon, authenticated;

create function public.issue_windows_beta_code(tester_email text)
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
    on conflict (email) do update set code_hash = excluded.code_hash;
  return code;
end
$$;

create function public.begin_windows_beta_final_week(tester_email text)
returns timestamptz language plpgsql set search_path = '' as $$
declare cutoff timestamptz;
begin
  update acoustic_beta.windows_beta_access
    set ends_at = coalesce(ends_at, statement_timestamp() + interval '168 hours')
    where email = lower(btrim(tester_email))
    returning ends_at into cutoff;
  if not found then
    raise exception 'No managed Windows beta access for this email';
  end if;
  return cutoff;
end
$$;

create function acoustic_beta.lookup_access(activation_code text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select jsonb_build_object(
      'status', case when ends_at <= statement_timestamp() then 'ended' else 'active' end,
      'serverTime', statement_timestamp(),
      'endsAt', ends_at
     )
     from acoustic_beta.windows_beta_access
     where activation_code ~ '^[0-9a-f]{48}$'
       and code_hash = extensions.digest(activation_code, 'sha256')),
    '{"status":"invalid"}'::jsonb
  );
$$;

create function public.check_windows_beta_access(activation_code text)
returns jsonb language sql stable set search_path = '' as $$
  select acoustic_beta.lookup_access(activation_code);
$$;

revoke all on function acoustic_beta.lookup_access(text) from public, anon, authenticated;
grant execute on function acoustic_beta.lookup_access(text) to anon;

revoke all on function public.issue_windows_beta_code(text) from public, anon, authenticated;
revoke all on function public.begin_windows_beta_final_week(text) from public, anon, authenticated;
revoke all on function public.check_windows_beta_access(text) from public, anon, authenticated;
grant execute on function public.check_windows_beta_access(text) to anon;
