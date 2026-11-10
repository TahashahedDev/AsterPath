-- Staff permissions now require a two-factor session (Supabase "aal2").
-- A stolen staff password alone can no longer read enquiries, profiles, the team
-- or the audit log: every policy that calls has_permission() fails until the
-- staff member has also entered a code from their authenticator app.
-- Students are unaffected (they hold no team permissions).
--
-- Rollback: re-run the original has_permission() definition from
-- 20261109120000_foundation.sql (identical, without the aal condition).

create or replace function public.has_permission(requested text) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt()) ->> 'aal', 'aal1') = 'aal2'
    and exists (
      select 1
      from public.team_members tm
      join public.role_permissions rp on rp.role = tm.role
      where tm.user_id = (select auth.uid())
        and tm.active
        and rp.permission = requested
    )
$$;
