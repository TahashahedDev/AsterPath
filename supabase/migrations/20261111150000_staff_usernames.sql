-- Team usernames, so staff can sign in with a username (e.g. "TahaShahed")
-- instead of typing their email. Passwords stay in Supabase Auth (bcrypt);
-- nothing here stores or checks a password.
--   team_members.username            unique ignoring case (TahaShahed = tahashahed)
--   staff_email_for_username(text)   server-side lookup for the sign-in action;
--                                    callable only with the service role, so the
--                                    public cannot map usernames to emails
-- Additive only.
--
-- Rollback:
--   drop function public.staff_email_for_username(text);
--   alter table public.team_members drop column username;

alter table public.team_members
  add column username text check (username ~ '^[A-Za-z0-9._-]{3,32}$');
create unique index team_members_username_idx on public.team_members (lower(username));

create function public.staff_email_for_username(p_username text) returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.email::text
  from public.team_members tm
  join auth.users u on u.id = tm.user_id
  where lower(tm.username) = lower(p_username) and tm.active
$$;

revoke execute on function public.staff_email_for_username(text) from public, anon, authenticated;
grant execute on function public.staff_email_for_username(text) to service_role;
