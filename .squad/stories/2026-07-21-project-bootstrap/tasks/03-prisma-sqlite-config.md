# Prisma + SQLite configuration (no models)

## Description
Wire Prisma to a local SQLite database per CLAUDE.md's stack decision, with
zero models. This task only configures the datasource/generator — the first
model, the generated client, and an `infra/` repository wrapper land in
whichever future task introduces the first real entity. Prisma refuses to
run `generate` with zero models defined ("You don't have any models defined
in your schema.prisma, so nothing will be generated"), so `generate` is
deliberately not run here — trying to force it (e.g. by adding a throwaway
placeholder model) would violate this story's "no tables yet" scope, so
don't.

## When to run
- Depends on: 01 (needs `package.json` to exist)
- Parallel-safe with: 02

## How-to

1. Install: `npm install prisma @prisma/client`.
2. Run:
   ```
   npx prisma init --datasource-provider sqlite --no-skills
   ```
   - `--datasource-provider sqlite` is required — recent Prisma versions
     default `prisma init` (with no provider flag) to a hosted Prisma
     Postgres setup, not local SQLite.
   - `--no-skills` skips Prisma's own agent-skills installer — this repo
     already has its own CLAUDE.md-based instruction system.
   - Do **not** pass `--with-model` — it would add an example model,
     violating this story's "no tables yet" scope.
   - This creates `prisma/schema.prisma` (datasource + generator blocks,
     zero models) and a `.env` with a `DATABASE_URL` placeholder.
3. Edit `.env`: set `DATABASE_URL="file:./dev.db"`. Create `.env.example`
   with the same content — nothing secret here (it's just a local file
   path), but keep the convention of never committing `.env` itself.
4. Confirm `.gitignore` (created by task 01's `create-next-app` run) ignores
   `.env*` and `node_modules`/`.next`; add `/prisma/*.db` and
   `/prisma/*.db-journal` if not already covered.
5. Do **not** run `npx prisma generate` (see Description — it errors on zero
   models). Do **not** create an `src/infra/` Prisma client wrapper yet —
   there's no generated client to wrap until `generate` has run at least
   once against a schema with a model.

## Verification
- `npx prisma validate` succeeds (schema syntax/config is valid even with
  zero models — only `generate` refuses on an empty schema).
- `npm run lint` — all-green.
- `git status` shows `.env` untracked/ignored and `.env.example` tracked.
