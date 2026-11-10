-- Names of active team members, so staff who work on leads can assign an advisor
-- and see who owns a lead. team_members itself stays readable only by managers;
-- this returns just id, name and role, and only to staff holding 'leads.read'.
-- Additive only.
--
-- Rollback: drop function public.team_directory();

create or replace function public.team_directory()
returns table (user_id uuid, full_name text, role public.team_role)
language sql stable security definer set search_path = '' as $$
  select tm.user_id, coalesce(nullif(p.full_name, ''), 'Team member'), tm.role
  from public.team_members tm
  left join public.profiles p on p.id = tm.user_id
  where tm.active and public.has_permission('leads.read')
  order by 2
$$;

revoke execute on function public.team_directory() from public, anon;
grant execute on function public.team_directory() to authenticated;
