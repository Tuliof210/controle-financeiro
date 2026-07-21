# controle-financeiro

## Stack
- Next.js (App Router) — single app serving both the frontend and the API
  (Route Handlers), TypeScript
- SQLite — local, file-based database (no server process)
- Sass Modules — component styling (`.module.scss`)
- Biome — lint & format (gates review, see .squad/ARCHITECTURE.md)
- Vitest — testing
- Zod — request validation
- Runs entirely on the user's local machine (not deployed)

## Commands
- `npm run dev` — start the local dev server
- `npm run build` — production build
- `npm run lint` — Biome check (lint + format, gates review)
- `npm run test` — Vitest (single run)

## Do-not-touch
None yet.

---
Product: see .squad/PRODUCT.md
Architecture and conventions: see .squad/ARCHITECTURE.md
