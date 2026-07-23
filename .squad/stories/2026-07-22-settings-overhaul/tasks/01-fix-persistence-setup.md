# Fix the persistence setup (the 500) — durably

## Description
The whole `/configuracoes` screen 500s because the database has no tables. The
runtime Prisma client (`src/infra/db/client.ts`) connects to `file:./dev.db`
via a `process.env.DATABASE_URL ?? "file:./dev.db"` fallback, but that file is
**0 bytes** — the `init_settings` migration was never applied. It was never
applied because `prisma.config.ts` reads `datasource.url` from
`process.env.DATABASE_URL` with **no fallback**, and there is **no `.env`** in
the repo (only `.env.example` with `DATABASE_URL="file:./dev.db"`), so
`npx prisma migrate deploy/status` abort with *"The datasource.url property is
required in your Prisma config file"*. On top of that, the `GET` route handlers
have no `try/catch`, so a DB error becomes an unhandled 500 instead of the
standard `{ error }` envelope.

Make this work on a fresh checkout with **no manual `.env` fiddling**, and make
the failure mode graceful. This is the urgent unblocker — run it first.

## When to run
- Depends on: none
- Parallel-safe with: 02, 03

## How-to
**1. Align the CLI config fallback with the runtime client.** In
`prisma.config.ts:12`, change `url: process.env.DATABASE_URL` to
`url: process.env.DATABASE_URL ?? "file:./dev.db"` so the Prisma CLI resolves
the same default the runtime already uses (`src/infra/db/client.ts:5`). This
lets `prisma migrate deploy` run out of the box; `.env.example` still documents
overriding it.

**2. Add a `db:setup` npm script.** In `package.json` scripts, add
`"db:setup": "prisma migrate deploy"` (applies committed migrations, creating
the three tables). Keep `postinstall: "prisma generate"` as-is. Optionally add
`"db:migrate": "prisma migrate dev"` for authoring future migrations — only if
trivial; don't gold-plate.

**3. Apply the migration** to create the tables in the (currently empty)
`dev.db`: run `npm run db:setup`. Then confirm the tables exist (the migration
in `prisma/migrations/20260722152226_init_settings/migration.sql` creates
`Person`, `Goal`, `Settings` + the `Person_name_key` unique index).

**4. Harden the `GET` handlers** so a future DB error returns the standard
envelope + 500 instead of an unhandled throw. `src/app/api/people/route.ts`,
`goals/route.ts`, `settings/route.ts` each have a `GET` that directly returns
`ok(await list…())` with no `try/catch`. Wrap them to catch and map to the
existing error envelope helper — imitate exactly how `POST`/`DELETE`/`PUT` in
the same files already build their error responses (find the `error(...)` /
`{ error: { message, code } }` helper they use and reuse it; do **not**
invent a new shape). Keep each handler under the 100-line cap.

**5. Document the setup step.** Add a one-liner to `README.md` (and/or the
`## Commands` block in `CLAUDE.md`): after `npm install`, run `npm run db:setup`
before `npm run dev`. Match the existing doc tone.

**Files:** `prisma.config.ts`, `package.json`, `src/app/api/{people,goals,settings}/route.ts`, `README.md` (and/or `CLAUDE.md`).

**Do NOT:** create a committed `.env` (it's gitignored except `.env.example`);
change the schema; add a seed with fake data (YAGNI).

**Verification:**
- `npm run db:setup` succeeds and creates the tables (re-running is a no-op —
  `migrate deploy` is idempotent).
- `npm run lint`, `npm run test`, `npm run build` all green.
- Start the dev server (`npm run dev`, or from a worktree on a spare port) and
  load `/configuracoes` — **no 500s**; all four sections render (empty states,
  since the DB is fresh). Confirm via the browser preview: no "Erro inesperado",
  no console/network 500s (`read_network_requests`).
- Sanity: temporarily point at a bogus DB path to confirm a GET now returns the
  `{ error }` envelope (500) rather than crashing — then revert.
