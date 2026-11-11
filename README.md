# AsterPath

[![CI](https://github.com/TahashahedDev/AsterPath/actions/workflows/ci.yml/badge.svg)](https://github.com/TahashahedDev/AsterPath/actions/workflows/ci.yml)

AsterPath — an Italy-specialist study consultancy for students applying from India.

The public website, the student portal and the founder's admin workspace (leads, casework, applications, payments, referrals, calendar, marketing) in one Next.js app on Supabase. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Getting started

Requires Node.js 22+.

```bash
npm install
cp .env.example .env.local   # placeholders only — the app runs with no external services
npm run dev                  # http://localhost:3000
```

Enquiries submitted locally are written to `.data/leads.ndjson` (git-ignored). Use only synthetic test data.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run check` | Typecheck, lint and unit tests |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Browser tests (Playwright, uses your installed Google Chrome): every public page at 5 screen sizes in light and dark, plus accessibility checks |
| `npm run db:test` | Applies every migration to a throwaway local PostgreSQL and runs the Row Level Security checks |
| CI (GitHub Actions) | Every push to `main` and every pull request runs typecheck, lint, unit tests, the dependency audit, the migrations with RLS checks, and the browser tests. Dependabot proposes dependency updates weekly. |
| `npm run admin:create` | Creates the owner account in Supabase (asks for the password in the terminal; nothing is stored in the code) |

## What is and isn't connected

| Area | Status |
| --- | --- |
| Public website (Italy guide, levels, scholarships with region map, process, documents, pricing, about, legal drafts) | Working. Content lives in `src/content/` until the database exists; Italy facts carry sources and a checked-on date in `src/content/italy/`. |
| Enquiry form → API | Working. A local dev file without Supabase; in production it is saved to Supabase, and refuses with a WhatsApp fallback if Supabase is missing. |
| Accounts | Students sign up at `/sign-up`; the team signs in at `/staff/sign-in` with a username or email plus an authenticator app. Disabled until Supabase is connected. |
| Student portal / admin | Live on Supabase data with Row Level Security; layout previews in development without Supabase; 404 in production without it. |
| Email | Resend: new-enquiry alerts, student confirmations and the 08:00 IST morning briefing, once `RESEND_API_KEY` is set. |
| Bookings | Cal.com (Google Meet) with a signed webhook. |
| Document uploads, online payments | Not built yet: uploads wait for private storage with signed links; payments are confirmed manually with a bank reference. |

Italy guidance was checked against official sources on 9 November 2026 and is marked as such until a named team member signs it off (`contentReview` in `src/content/italy/sources.ts`). Legal pages are drafts pending lawyer review; business details in `legalEntity` (`src/config/site.ts`) are placeholders.

## Promo video

The overview film is made with Remotion in `video/` (separate dependencies). `cd video && npm install`, then `npm run studio` to edit, `npm run render` for the website version (written to `public/video/`) or `npm run render:vertical` for a 9:16 Reels/Status version in `video/out/`. Remotion is free for individuals and companies of up to three people; larger teams need a company licence.
