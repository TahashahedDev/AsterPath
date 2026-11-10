-- Local development seed. Synthetic people only: never real students or staff.
-- Runs after the migrations on `supabase db reset` (local stack only, never production).
--
-- Accounts (email login), all with the local-only password: AsterPath-local-only-7Kq2
--   owner@asterpath.test    team owner
--   advisor@asterpath.test  advisor
--   student@asterpath.test  student, no team role

do $$
declare
  account record;
begin
  for account in
    select * from (values
      ('00000000-0000-4000-8000-000000000001'::uuid, 'owner@asterpath.test', 'Olivia Owner (synthetic)'),
      ('00000000-0000-4000-8000-000000000002'::uuid, 'advisor@asterpath.test', 'Arjun Advisor (synthetic)'),
      ('00000000-0000-4000-8000-000000000003'::uuid, 'student@asterpath.test', 'Sana Student (synthetic)')
    ) as t(id, email, full_name)
  loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000', account.id, 'authenticated', 'authenticated', account.email,
      extensions.crypt('AsterPath-local-only-7Kq2', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name', account.full_name, 'terms_version', 'draft-2026-11', 'privacy_version', 'draft-2026-11-b'),
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), account.id, account.id::text,
      jsonb_build_object('sub', account.id::text, 'email', account.email, 'email_verified', true),
      'email', now(), now(), now()
    );
  end loop;
end;
$$;

insert into public.team_members (user_id, role) values
  ('00000000-0000-4000-8000-000000000001', 'owner'),
  ('00000000-0000-4000-8000-000000000002', 'advisor');

insert into public.leads (
  id, reference, status, assigned_to, follow_up_due_at,
  full_name, email, whatsapp, residence,
  level, intake, field_of_study, scholarship_interest,
  highest_qualification, academic_background, english_test, passport_status, budget_range,
  consultation_method, message,
  privacy_notice_version, contact_consent, age_or_guardian_confirmed, updates_consent, consent_recorded_at,
  attribution
) values
  ('10000000-0000-4000-8000-000000000001', 'AP-261109-TEST1', 'new', null, now() + interval '1 day',
   'Test Student One', 'test.one@example.com', '+91 90000 00001', 'Karnataka',
   'masters', 'autumn-2027', 'Data Science', 'yes',
   'bachelors-4', 'Synthetic record: B.Tech, 7.8 CGPA', 'planning', 'valid', '10-20l',
   'whatsapp', 'Synthetic seed enquiry.',
   'draft-2026-11-b', true, true, false, now(),
   '{"landingPath":"/","utmSource":"seed"}'),
  ('10000000-0000-4000-8000-000000000002', 'AP-261109-TEST2', 'contacted', '00000000-0000-4000-8000-000000000002', now() + interval '3 days',
   'Test Student Two', 'test.two@example.com', '+91 90000 00002', 'Maharashtra',
   'bachelors', 'autumn-2027', 'Architecture', 'unsure',
   'class-12', 'Synthetic record: Class 12, 88%', 'booked', 'applied', 'under-10l',
   'video', '',
   'draft-2026-11-b', true, true, true, now(),
   null),
  ('10000000-0000-4000-8000-000000000003', 'AP-261109-TEST3', 'qualified', '00000000-0000-4000-8000-000000000002', now() + interval '7 days',
   'Test Student Three', 'test.three@example.com', '+91 90000 00003', 'Delhi',
   'phd', 'autumn-2028', 'Physics', 'yes',
   'masters', 'Synthetic record: M.Sc. Physics', 'taken', 'valid', '20l-plus',
   'phone', 'Synthetic seed enquiry about doctoral calls.',
   'draft-2026-11-b', true, true, false, now(),
   null);
