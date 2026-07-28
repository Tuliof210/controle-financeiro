# controle-financeiro

## Stack
- Next.js (App Router) — single app serving both the frontend and the API
  (Route Handlers), TypeScript
- SQLite — local, file-based database (no server process)
- Sass Modules — component styling (`.module.scss`)
- Design System foundations — tokens + rules in `src/styles/` (see
  `src/styles/README.md`); documented as Storybook Foundations MDX docs
  (`.storybook/`, `src/styles/docs/`) — no components yet
- Biome — lint & format (gates review, see .squad/ARCHITECTURE.md)
- Vitest — testing
- Playwright — end-to-end tests (specs in `e2e/`)
- Zod — request validation
- Runs entirely on the user's local machine (not deployed)

## Commands
- `npm run db:setup` — apply migrations, creating the local SQLite tables
  (idempotent; run once after `npm install` on a fresh checkout)
- `npm run dev` — start the local dev server
- `npm run build` — production build
- `npm run lint` — Biome check (lint + format, gates review)
- `npm run test` — Vitest (single run)
- `npx playwright install chromium` — download the browser Playwright drives
  (run once after `npm install` on a fresh checkout)
- `npm run test:e2e` — Playwright; boots its own dev server on :3100 against a
  throwaway `e2e.db`, never `dev.db`. Specs go in `e2e/` (empty for now)
- `npm run storybook` — Storybook dev server (Foundations MDX docs, :6006)
- `npm run build-storybook` — static Storybook build

## Do-not-touch
None yet.

---
Product: see .squad/PRODUCT.md
Architecture and conventions: see .squad/ARCHITECTURE.md
