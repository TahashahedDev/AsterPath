# Architecture

One Next.js application (App Router, TypeScript strict) serving four products: the public website, the student portal, the admin workspace and, later, AI-assisted operations. The backend will be Supabase (Postgres, Auth, private Storage, Row Level Security). Everything is designed so a future Expo mobile app can reuse the same API boundaries and auth.

## Layout

```
src/
  app/
    (marketing)/     public site — static where possible
    (auth)/          sign-in / sign-up
    (student)/portal student portal (signed-in students; 404 until Supabase is configured)
    (admin)/admin    admin workspace (active team members only)
    api/             route handlers (/api/enquiries)
    auth/            /auth/google and /auth/callback (Supabase Auth)
  components/        ui/ (primitives), layout/, marketing/, forms/, dashboard/
  config/site.ts     public, non-secret settings (WhatsApp number, contact email, nav)
  content/           seed content: italy/ (facts, regions, universities, levels, process, documents, sources), plan, FAQs
  content/geo/       map data: Natural Earth India point-of-view borders, ISTAT Italian regions
  features/          domain logic shared by client and server (schemas, pure calculations)
  lib/               env validation, security helpers, small utilities
  server/            server-only code: services/, repositories/, integrations/, auth/
  proxy.ts           session refresh and sign-in redirect for /portal and /admin
supabase/            migrations, seed, CLI config and RLS tests
tests/unit/          Vitest
```

Rules of thumb:

- **UI never talks to storage directly.** Route handler → service (`server/services`) → repository (`server/repositories`). Everything under `server/` imports `server-only`.
- **Validation is shared.** Zod schemas in `features/*/schema.ts` validate in the browser for UX and again on the server as the authority.
- **No hidden business rules in code.** Prices, packages and country procedures live in `content/` now and move to admin-editable tables later. Pure calculations (e.g. `features/payments/milestones.ts`) are separate and unit-tested.
- **Integrations degrade honestly.** If a provider isn't configured, the code returns a "not connected" state that the UI explains. Nothing simulates success.

## Enquiry flow

`EnquiryForm` (4 steps, per-step validation) → `POST /api/enquiries`:

1. Same-origin check on the `Origin` header.
2. Per-IP fixed-window rate limit (5 / 10 min). *In-memory: correct for one instance only — must move to a shared store before multi-instance hosting.*
3. 16 KB body limit, Zod validation.
4. Spam checks: honeypot field and minimum fill time, rejected with a generic message.
5. `createLead` builds a lead with a UUID, a human reference (`AP-YYMMDD-XXXXX`), consent record (privacy-notice version, contact consent, optional updates consent), first-touch UTM attribution and a follow-up due date.
6. The configured `LeadStore` persists it: `supabase` (a row in `public.leads`, written with the service role), `local` (dev file) or `none` (returns 503 → WhatsApp fallback). Production defaults to `supabase` once its keys are set and to `none` before that; `LEAD_STORE=local` is refused in production.

## Database and accounts (Phase 2)

Supabase (Postgres, Auth, RLS). Schema lives in `supabase/migrations/`, synthetic seed data in `supabase/seed.sql`, local CLI settings in `supabase/config.toml`.

- **Tables:** `profiles` (one per account, created by a trigger on `auth.users`, records the terms and privacy versions accepted at sign-up), `team_members` (staff and their `team_role`), `permissions` and `role_permissions` (what each role may do), `leads` (enquiries) and `audit_events`.
- **Roles:** owner, admin, advisor, document reviewer, finance, marketing, analyst. A student is any account without a team role. Marketing and analysts get aggregated reports only, never contact details, passports or finances.
- **Authorisation lives in the database.** Every table has RLS. Policies call `has_permission('leads.read')` etc., which reads the caller's active team role. Visitors (anon) can read nothing; enquiries are inserted only by the server. Only an owner can create, change or remove an owner, and nobody can remove themselves.
- **Audit log:** triggers on profiles, leads, team members and role permissions write `audit_events` (who, what, which columns). For tables holding personal data the log records which columns changed, never their values. The log is append-only for every client.
- **App access:** `lib/supabase/server.ts` acts as the signed-in user (RLS applies); `lib/supabase/admin.ts` uses the service role and is imported only by the Supabase lead store. `proxy.ts` refreshes sessions on the signed-in areas and redirects signed-out visitors; the portal and admin layouts re-check with Supabase Auth (`server/auth/viewer.ts`), and the admin layout returns 404 to anyone without an active team role.
- **Two entry points:** students use `/sign-in` and `/sign-up` (self-service); the team uses `/staff/sign-in` (invitation only, from Admin → Team, which calls Supabase `inviteUserByEmail` and writes the membership as the inviter so RLS and the audit log apply). After sign-in, team members land in `/admin` and students in `/portal`; a student account is refused on the team page, and team members visiting `/portal` are sent to `/admin`. Password recovery: `/forgot-password` → emailed link → `/reset-password`.
- **Team usernames and the owner account:** staff sign in with a username (e.g. `TahaShahed`) or their email. The server turns a username into the email with `staff_email_for_username()` (migration `20261111150000_staff_usernames.sql`, service role only), and an unknown username gets the same answer as a wrong password. The first owner is created once with `npm run admin:create`, which asks for the password hidden in the terminal and sends it straight to Supabase Auth; no credential is stored in the code, the repository or environment files.
- **Staff two-factor is enforced in the database:** `has_permission()` requires an `aal2` session (migration `20261110130000_staff_mfa.sql`), so a password alone reads no staff data. The admin layout sends staff to `/staff/mfa` to add an authenticator app (TOTP) or enter its code.
- **Business model:** the operating playbook (`content/playbook.ts`, shown at `/admin/playbook`) and the internal rate card and quote engine (`content/pricing.ts`, `features/pricing/quote.ts`, `/admin/pricing`). Both are marked as proposals until the founder confirms; prices never appear publicly.
- **Sign-in:** email and password (server actions with Zod validation and a per-source rate limit, no account enumeration) and Google (`/auth/google` → Supabase → `/auth/callback`, post-login paths limited to `/portal` and `/admin`). Until Supabase is configured the forms are disabled and `/portal` and `/admin` return 404 in production.
- **Tests:** `npm run db:test` applies the migrations and seed to a throwaway local PostgreSQL (with a small stand-in for Supabase's `auth` schema) and checks every RLS rule and the audit trail. Types in `lib/supabase/types.ts` are hand-written to match the migration; regenerate them with the Supabase CLI once it is set up.
- **New tables later:** Supabase grants new tables to `anon` and `authenticated` by default, so every migration must enable RLS and revoke what it does not need, as the foundation migration does.

## Operations platform (admin workspace and student portal)

- **Data contracts:** `features/operations/types.ts` defines leads, students, cases, applications, documents (categories and statuses), tasks, invoices and instalments, messages, calendar and referrals. Pages render these shapes only, so swapping a fixture for a Supabase repository does not touch the UI.
- **Demo data is isolated:** `server/demo/workspace.ts` (and `server/demo/portal.ts`) hold synthetic records. They are shown only when `isDemoWorkspaceEnabled()` (development, or `DEMO_WORKSPACE=enabled` for signed-in staff on a preview) and every page using them renders `<DemoNotice />`. Production without the flag shows honest empty states.
- **Real today:** the Leads list and CRM read real enquiries through `server/services/lead-directory.ts` (Supabase as the signed-in staff member, or the local dev store), falling back to demo data only outside production. Team and Audit log read Supabase.
- **Not live yet (UI disabled with the reason shown):** document upload and review (needs a private Storage bucket, per-student policies, signed URLs, type/size validation and a retention policy), online payments (Razorpay test mode, server-side order creation, signature and webhook verification), in-portal messaging, CRM writes.
- **Shared UI:** `components/dashboard/` (shell, grouped navigation, PageHeader, Panel, StatCard, StatusPill, DataTable that becomes a card list on phones).

## Integrations and AI

- `server/integrations/registry.ts` checks each provider with a harmless read-only request (Supabase Auth health and settings, Cal.com page, Razorpay orders list in test mode, Resend domains, Ollama tags). A key being present never counts as connected; secret values are never returned. Shown at `/admin/integrations`.
- AI is local-first and optional: `server/ai/provider.ts` (LLM provider interface, Ollama implementation), `server/ai/knowledge.ts` (only the sourced public content, each passage with source and checked date), `features/ai/agents.ts` (registry of ten agents, three enabled, plus guardrails), `server/ai/run-agent.ts` (retrieval → grounded prompt → draft for human review; refuses when no approved source matches; reports "LLM not connected" when Ollama is down). Runs through a staff-only server action at `/admin/ai`. Agents never receive student records.
- Enquiries record `destination` (Italy, Germany, France, undecided) and `pathway` (study or work-visa guidance) — migration `20261110120000_lead_destination.sql`.
- The CRM saves stage changes through a server action running as the signed-in staff member (RLS `leads.write`, audited). The pipeline adds `proposal`, `agreement` and `payment` statuses and a `lost_reason` column — migration `20261110140000_lead_pipeline.sql`. Owners and admins change roles or deactivate members on the Team page; nobody can change their own row.
- Staff assign a lead's advisor and next follow-up on the lead page. `team_directory()` returns active members' names to staff with `leads.read`, so advisors can assign without reading `team_members` — migration `20261110150000_team_directory.sql`.
- **Casework** (migration `20261110160000_student_cases.sql`): staff add notes to a lead and save quotes to it (the figure is recomputed on the server). Once the agreement is signed, `open_case()` creates the student case and its instalment schedule from the chosen quote, with the first instalment due, and converts the lead. Finance confirms each instalment against the bank or Razorpay record with its reference (a paid row without a reference and confirmer is rejected by the database). Confirming the first instalment activates the case. A student's portal links to their case when their verified sign-up email matches (`claim_my_case()`) and shows their stage, tasks and instalments. New permissions: `cases.write` (owner, admin, advisor) and `payments.write` (owner, admin, finance). Portal demo data is off whenever Supabase is configured.

## Design system

Tokens are defined once in `src/app/globals.css` (`@theme`). Geist (sans) and Instrument Serif (editorial accents) are self-hosted via `next/font`. `muted` is darkened from the brief's `#727D89` to meet WCAG AA for body text; the original is kept as `subtle` for decoration.

Theming: light and dark tokens live together in `globals.css`; components only use token names, never raw colours. The preference (`light` / `dark` / `system`, default `system`) is stored in localStorage and resolved to `<html data-theme>` by a tiny inline script in `<head>` before first paint, so there is no flash. `src/lib/theme.ts` owns the logic; `ThemeWatcher` follows device changes and other tabs. A `prefers-color-scheme` fallback keeps dark mode working without JavaScript. `inverse` is the deep-navy emphasis surface (CTA, highlighted package) in both themes. The hero canvas reads tokens via `getComputedStyle` and repaints on theme change.

Responsive: mobile-first Tailwind breakpoints; gutters and the floating WhatsApp button respect iOS safe-area insets (`viewport-fit=cover`); wide tables and carousels scroll inside focusable regions, never the page. Note: anything `position: fixed` must not live inside the header — its `backdrop-filter` becomes the containing block.

Typography: Cormorant Garamond (display, semibold with a medium italic accent) and Manrope (text) via `next/font`, self-hosted. Palette adds terracotta to ivory, ink and emerald.

Maps: `src/lib/geo.ts` (server-only) projects TopoJSON with d3-geo and returns SVG path strings, so pages ship no map library. India's outline must follow India's official boundaries — always use the Natural Earth *India point-of-view* dataset (`countries-india-pov.json`), never default world borders. The home journey map animates entirely in CSS (route draw → camera zoom into Italy); the scholarship region explorer is a small client component.

Motion: scroll reveals use CSS scroll-driven animations (no JS; content is simply visible where unsupported). Everything respects `prefers-reduced-motion`, which jumps straight to the final state.

Video: Remotion project in `video/`, excluded from the app's TypeScript, lint and tests.

## Security baseline

Security headers and CSP in `next.config.ts`. `script-src` currently allows `'unsafe-inline'` because Next.js injects inline bootstrap scripts into static pages; move to nonce-based CSP when auth makes pages dynamic. Documents will never be accepted through public forms.

## Roadmap status

| Phase | Status |
| --- | --- |
| 0 Audit | Done (empty directory, no git) |
| 1 Brand & frontend | Done, except items listed below |
| 2 Backend foundation | Built and tested locally; needs a Supabase project and Google OAuth client to go live |
| 3+ | Not started |

Positioning: Italy is the only launched destination; Germany and France have honest "opening next" pages and take enquiries, with no country requirements published until verified. Work-visa help is guidance on official routes only — no recruiting, job finding or placement (that needs a recruiting-agent licence in India).

Phase 1 gaps: newsletter signup (needs email provider + consent storage), founder profiles (`founders` in site config), OG images, photography (Higgsfield account had no credits).

Testing: `tests/unit` (Vitest) and `tests/e2e` (Playwright against a production build: no sideways scrolling on any page at 320–1920px in both themes, axe WCAG 2.1 AA including colour contrast, theme persistence and no-flash, mobile navigation).

## Founder notifications and bookings

- **New enquiry:** after the enquiry is saved and the student has their reference, `after()` sends two emails through Resend: an alert to `LEAD_NOTIFY_EMAIL` (details plus one-tap "Reply on WhatsApp", "Email them" and "Open in admin") and a confirmation to the student (reference, next steps, prefilled booking link). Email failures are logged and never affect the saved enquiry. Without Resend nothing is sent and a reference-only log line is written.
- **Morning briefing:** Vercel cron `/api/cron/daily-digest` (08:00 IST, `CRON_SECRET`) emails `LEAD_NOTIFY_EMAIL` one summary: leads waiting for a first reply, calls in the next 24 hours, follow-ups due, application deadlines within 14 days, overdue student tasks, instalments due within 7 days, and referral credits to decide. It reads with the service role (cron only), carries names, dates and admin links but no contact details or messages, and sends nothing on a day with nothing to do.
- **Booking:** `NEXT_PUBLIC_BOOKING_URL` (Cal.com, connected to Google Calendar with Google Meet as the location). The enquiry success screen and every WhatsApp first reply link to it with name, email and the enquiry reference prefilled.
- **Booked calls:** Cal.com posts to `/api/webhooks/cal`, verified with `CAL_WEBHOOK_SECRET` (HMAC-SHA256). The call is stored in `bookings` (migration `20261111120000_bookings.sql`, service role only, readable with `leads.read`), linked to the lead by reference or email, and a new or contacted lead moves to "consultation booked".
- **Admin:** the overview starts with "Waiting for a first reply" (one-tap WhatsApp with the message written) and "Upcoming calls" (one-tap Join Meet). Lead pages and the CRM drawer have the same reply button and show booked calls.

## Website analytics (first-party, anonymous)

- `components/layout/attribution-capture.tsx` sends page views, labelled button presses (`data-track`), WhatsApp and booking taps, and enquiry started/submitted to `/api/events` with `sendBeacon`. No cookies, no third-party script; nothing is sent under Global Privacy Control or Do Not Track.
- `/api/events` accepts same-site requests only, ignores bots, rate-limits in memory, and stores the event after responding (`after()`) in `site_events` (migration `20261111130000_site_events.sql`): page, label, campaign or referring site, device class and a per-tab random id. No IP, user agent or form contents.
- `marketing_summary(days)` aggregates visits, the visit → enquiry funnel, channels with conversion, campaigns, pages and buttons for Admin → Marketing (RLS `reports.read`).
- The pages read during a visit stay on the device and are sent only inside an enquiry; the lead page shows "How they found us".
- Retention: Vercel cron `/api/cron/prune-analytics` (daily, `CRON_SECRET`) calls `prune_site_events()` to keep 13 months.
- Deliberately not built: identifying anonymous visitors or contacting people who have not enquired (DPDP Act 2023 consent rules, TRAI rules on unsolicited calls).

## Applications, referrals and the journey map

- `case_applications` (migration `20261111140000_applications_referrals.sql`): each university a student applies to, with deadline, status and portal reference. Staff manage them on the student case; the student sees their own in the portal. Admin → Applications lists all of them by deadline; Admin → Calendar combines booked calls, application deadlines, student tasks and instalments due.
- Referrals: every case has a `referral_code`. A visit with `?ref=CODE` is remembered on the device and sent with an enquiry; after the enquiry is saved, `recordReferral` (service role) links it to the referring case (self-referrals ignored). Finance, admins and owners approve or decline the credit (amount from `content/pricing.ts`) in Admin → Referrals. The referring student sees only that their code was used.
- The portal's applications, referrals, profile, documents and messages pages read the student's own case once Supabase is configured. Documents stay closed for uploads until private storage ships.
- `content/playbook.ts` now records, for every stage, what the student sees and where the team does it in the admin, rendered on Admin → Playbook as the end-to-end journey map.
