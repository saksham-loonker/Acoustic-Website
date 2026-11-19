create table acoustic_beta.windows_beta_pairs (
  challenge text primary key check (challenge ~ '^[0-9a-f]{64}$'),
  email text not null references public.beta_mailing_list(email) on delete cascade,
  expires_at timestamptz not null
);
alter table acoustic_beta.windows_beta_pairs enable row level security;
revoke all on acoustic_beta.windows_beta_pairs from public, anon, authenticated;
grant usage on schema acoustic_beta to authenticated;

create function acoustic_beta.authorize_pair(pair_challenge text)
returns text language plpgsql security definer set search_path = '' as $$
declare address text;
begin
  select lower(u.email) into address from auth.users u
    where u.id = auth.uid() and u.email_confirmed_at is not null;
  if address is null or pair_challenge is null or pair_challenge !~ '^[0-9a-f]{64}$'
    then return 'invalid'; end if;
  if not exists (select 1 from public.beta_mailing_list where email = address)
    then return 'signup_required'; end if;
  if exists (select 1 from acoustic_beta.windows_beta_access
      where email = address and ends_at <= statement_timestamp())
    then return 'ended'; end if;

  delete from acoustic_beta.windows_beta_pairs where expires_at <= statement_timestamp();
  insert into acoustic_beta.windows_beta_pairs (challenge, email, expires_at)
    values (pair_challenge, address, statement_timestamp() + interval '10 minutes')
    on conflict (challenge) do nothing;
  if exists (select 1 from acoustic_beta.windows_beta_pairs
      where challenge = pair_challenge and email = address)
    then return 'approved'; end if;
  return 'invalid';
end
$$;

create function acoustic_beta.claim_pair(activation_code text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  address text;
  digest bytea;
  approved text;
begin
  if activation_code is null or activation_code !~ '^[0-9a-f]{48}$' then return 'invalid'; end if;
  digest := extensions.digest(activation_code, 'sha256');
  delete from acoustic_beta.windows_beta_pairs
    where challenge = encode(digest, 'hex') and expires_at > statement_timestamp()
    returning email into address;
  if address is null then
    return coalesce((select case when ends_at <= statement_timestamp() then 'ended' else 'active' end
      from acoustic_beta.windows_beta_access where code_hash = digest), 'waiting');
  end if;
  insert into acoustic_beta.windows_beta_access as access (email, code_hash)
    values (address, digest)
    on conflict (email) do update set code_hash = excluded.code_hash
    where access.ends_at is null or access.ends_at > statement_timestamp()
    returning email into approved;
  return case when approved is null then 'ended' else 'active' end;
end
$$;

create function public.authorize_windows_beta_pair(pair_challenge text)
returns text language sql set search_path = '' as $$
  select acoustic_beta.authorize_pair(pair_challenge);
$$;
create function public.claim_windows_beta_pair(activation_code text)
returns text language sql set search_path = '' as $$
  select acoustic_beta.claim_pair(activation_code);
$$;

revoke all on function acoustic_beta.authorize_pair(text) from public, anon, authenticated;
revoke all on function acoustic_beta.claim_pair(text) from public, anon, authenticated;
revoke all on function public.authorize_windows_beta_pair(text) from public, anon, authenticated;
revoke all on function public.claim_windows_beta_pair(text) from public, anon, authenticated;
grant execute on function acoustic_beta.authorize_pair(text), public.authorize_windows_beta_pair(text) to authenticated;
grant execute on function acoustic_beta.claim_pair(text), public.claim_windows_beta_pair(text) to anon;
