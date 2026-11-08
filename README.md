# AsterPath

International education guidance for students applying from India to universities in Italy, Germany and France.

This repository will hold the public website, student portal, admin workspace and AI operations system. **Current state: Phase 1** — the public website, enquiry flow and layout foundations. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

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

## What is and isn't connected

| Area | Status |
| --- | --- |
| Public website, pricing, destinations, services | Working. Content lives in `src/content/` until the database exists. |
| Enquiry form → API | Working. Storage is a local dev file; in production it refuses with a WhatsApp fallback until Supabase is connected. |
| WhatsApp | Click-to-chat links only (number in `NEXT_PUBLIC_WHATSAPP_NUMBER`). |
| Authentication | Not connected. Sign-in pages are designs with disabled controls. |
| Student portal / admin | Layout previews in development only; 404 in production. |
| Email, payments, AI | Not connected. |

Country information is marked **draft — not yet verified** on the site until a named reviewer checks it against official sources.
