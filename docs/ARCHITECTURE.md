# Architecture

One Next.js application (App Router, TypeScript strict) serving four products: the public website, the student portal, the admin workspace and, later, AI-assisted operations. The backend will be Supabase (Postgres, Auth, private Storage, Row Level Security). Everything is designed so a future Expo mobile app can reuse the same API boundaries and auth.

## Layout

```
src/
  app/
    (marketing)/     public site — static where possible
    (auth)/          sign-in / sign-up
    (student)/portal student portal (dev-only preview until Phase 2)
    (admin)/admin    admin workspace (dev-only preview until Phase 2)
    api/             route handlers (only /api/enquiries today)
  components/        ui/ (primitives), layout/, marketing/, forms/, dashboard/
  config/site.ts     public, non-secret settings (WhatsApp number, contact email, nav)
  content/           seed content: italy/ (facts, regions, levels, process, documents, sources), packages, FAQs
  content/geo/       map data: Natural Earth India point-of-view borders, ISTAT Italian regions
  features/          domain logic shared by client and server (schemas, pure calculations)
  lib/               env validation, security helpers, small utilities
  server/            server-only code: services/, repositories/, integrations/
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
6. The configured `LeadStore` persists it: `local` (dev file) or `none` (returns 503 → WhatsApp fallback). `LEAD_STORE=local` is refused in production by env validation.

## Design system

Tokens are defined once in `src/app/globals.css` (`@theme`). Geist (sans) and Instrument Serif (editorial accents) are self-hosted via `next/font`. `muted` is darkened from the brief's `#727D89` to meet WCAG AA for body text; the original is kept as `subtle` for decoration.

Theming: light and dark tokens live together in `globals.css`; components only use token names, never raw colours. The preference (`light` / `dark` / `system`, default `system`) is stored in localStorage and resolved to `<html data-theme>` by a tiny inline script in `<head>` before first paint, so there is no flash. `src/lib/theme.ts` owns the logic; `ThemeWatcher` follows device changes and other tabs. A `prefers-color-scheme` fallback keeps dark mode working without JavaScript. `inverse` is the deep-navy emphasis surface (CTA, highlighted package) in both themes. The hero canvas reads tokens via `getComputedStyle` and repaints on theme change.

Responsive: mobile-first Tailwind breakpoints; gutters and the floating WhatsApp button respect iOS safe-area insets (`viewport-fit=cover`); wide tables and carousels scroll inside focusable regions, never the page. Note: anything `position: fixed` must not live inside the header — its `backdrop-filter` becomes the containing block.

Typography: Bodoni Moda (display) and Manrope (text) via `next/font`. Palette adds terracotta to ivory, ink and emerald.

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
| 2+ | Not started |

Positioning: Italy only, students only (no work-visa services — placing people in jobs abroad requires a recruiting-agent licence in India). Old multi-country URLs redirect in `next.config.ts`.

Phase 1 gaps: newsletter signup (needs email provider + consent storage), founder profiles (`founders` in site config), OG images, photography (Higgsfield account had no credits).

Testing: `tests/unit` (Vitest) and `tests/e2e` (Playwright against a production build: no sideways scrolling on any page at 320–1920px in both themes, axe WCAG 2.1 AA including colour contrast, theme persistence and no-flash, mobile navigation).
