create function public.enroll_windows_beta(tester_name text, tester_email text, activation_code text)
returns text language plpgsql set search_path = '' as $$
declare
  address text := lower(btrim(tester_email));
  display_name text := btrim(tester_name);
  digest bytea;
  enrolled record;
begin
  if address is null or char_length(address) not between 3 and 254
    or address !~ '^[^[:space:]@]+@[^[:space:]@.]+(\.[^[:space:]@.]+)+$'
    or display_name is null or char_length(display_name) not between 1 and 120
    or activation_code is null or activation_code !~ '^[0-9a-f]{48}$'
    then return 'invalid'; end if;
  digest := extensions.digest(activation_code, 'sha256');

  insert into public.beta_mailing_list(email, name)
    values (address, display_name) on conflict (email) do nothing;
  insert into acoustic_beta.windows_beta_access(email, code_hash)
    values (address, digest) on conflict (email) do nothing;

  select code_hash, ends_at into enrolled
    from acoustic_beta.windows_beta_access where email = address;
  if enrolled.code_hash is distinct from digest then return 'existing'; end if;
  if enrolled.ends_at <= statement_timestamp() then return 'ended'; end if;
  return 'active';
end
$$;

create function public.stop_windows_beta_access(tester_email text)
returns timestamptz language plpgsql set search_path = '' as $$
declare cutoff timestamptz;
begin
  update acoustic_beta.windows_beta_access
    set ends_at = least(ends_at, statement_timestamp())
    where email = lower(btrim(tester_email))
    returning ends_at into cutoff;
  if not found then raise exception 'No managed Windows beta access for this email'; end if;
  return cutoff;
end
$$;

grant usage on schema acoustic_beta to service_role;
grant select, insert on acoustic_beta.windows_beta_access to service_role;
revoke all on function public.enroll_windows_beta(text, text, text) from public, anon, authenticated;
grant execute on function public.enroll_windows_beta(text, text, text) to service_role;
revoke all on function public.stop_windows_beta_access(text) from public, anon, authenticated, service_role;

revoke execute on function public.authorize_windows_beta_pair(text), acoustic_beta.authorize_pair(text)
  from authenticated;
revoke execute on function public.claim_windows_beta_pair(text), acoustic_beta.claim_pair(text)
  from anon;
