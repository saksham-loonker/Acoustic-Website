create table public.neurodivergent_mailing_list (
  email text primary key,
  name text not null,
  constraint neurodivergent_email_normalized check (
    email = lower(btrim(email)) and char_length(email) between 3 and 254
  ),
  constraint neurodivergent_name_present check (
    name = btrim(name) and char_length(name) between 1 and 120
  )
);

alter table public.neurodivergent_mailing_list enable row level security;
revoke all on table public.neurodivergent_mailing_list from public, anon, authenticated, service_role;
grant select, insert on table public.neurodivergent_mailing_list to service_role;
