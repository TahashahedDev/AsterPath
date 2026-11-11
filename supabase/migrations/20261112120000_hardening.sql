-- Two fixes found by checking the live project.
--   1. claim_my_case() compared emails with citext "=", but with search_path = ''
--      that operator isn't found and Postgres falls back to case-sensitive text
--      comparison. A student signing in as Priya@… was never linked to a case
--      opened for priya@…. Compare lower() of both sides instead.
--   2. Signed-out visitors (anon) could call current_team_role() and
--      has_permission(). Both return nothing useful without a session, and every
--      policy that uses them is for signed-in users only, so revoke anon's access
--      (Supabase advisor 0028).
-- Additive only: replaces one function body and narrows two grants.
--
-- Rollback: re-run claim_my_case() from 20261110160000_student_cases.sql, and
--   grant execute on function public.current_team_role(), public.has_permission(text) to anon;

create or replace function public.claim_my_case() returns void
language sql security definer set search_path = '' as $$
  update public.student_cases sc
     set student_user_id = u.id
    from auth.users u
   where u.id = (select auth.uid())
     and u.email_confirmed_at is not null
     and sc.student_user_id is null
     and lower(sc.student_email::text) = lower(u.email)
$$;

revoke execute on function public.current_team_role() from public, anon;
revoke execute on function public.has_permission(text) from public, anon;
grant execute on function public.current_team_role(), public.has_permission(text) to authenticated;
