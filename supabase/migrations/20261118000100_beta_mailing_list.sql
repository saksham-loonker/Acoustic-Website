create table public.beta_mailing_list (
  email text primary key,
  name text not null,
  constraint beta_email_normalized check (
    email = lower(btrim(email)) and char_length(email) between 3 and 254
  ),
  constraint beta_name_present check (char_length(btrim(name)) between 1 and 120)
);

alter table public.beta_mailing_list enable row level security;
revoke all on table public.beta_mailing_list from public, anon, authenticated;
grant select, insert on table public.beta_mailing_list to service_role;
