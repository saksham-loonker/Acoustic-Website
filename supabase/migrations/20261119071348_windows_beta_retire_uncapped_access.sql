-- Apply after the device-limited installer is live and verified.
-- Old managed builds understand "invalid" and direct testers to support.
create or replace function public.check_windows_beta_access(activation_code text)
returns jsonb language plpgsql stable set search_path = '' as $$
begin
  if current_user = 'anon' then return '{"status":"invalid"}'::jsonb; end if;
  return acoustic_beta.lookup_access(activation_code);
end
$$;

revoke execute on function acoustic_beta.lookup_access(text) from anon;
