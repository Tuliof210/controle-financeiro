# Persistence spine — Prisma models, migration, client, repositories

## Description
Bootstrap the app's entire persistence layer. This is the first feature to
touch the DB, so everything downstream (tasks 02, 05) depends on it. Define
the three domain models, run the first migration, add the Prisma client
singleton, and wire the clean-architecture data layer that
`.squad/ARCHITECTURE.md` mandates (`core/entities` types → `core/repositories`
interfaces → `infra/repositories` Prisma implementations). Also add Zod (the
documented request-validation dependency, not yet installed).

**Models** (SQLite, integer cents for money):
- `Person`: `id` (cuid), `name` (unique, required), `color` (string — a
  palette key), `createdAt`.
- `Goal` (Objetivo): `id` (cuid), `name` (required), `targetCents` (Int),
  `createdAt`.
- `Settings` (global singleton, id fixed to 1): `rangeStart` (Int? — `YYYYMM`,
  e.g. `202501`), `rangeEnd` (Int? — `YYYYMM`), `monthlyGoalCents` (Int?).
  All three fields nullable so the row can exist partially configured.

Range is stored as a single `YYYYMM` integer per bound (sorts and compares
correctly, trivially maps to/from month+year in the UI). Money is always an
integer number of cents — never a float.

## When to run
- Depends on: none
- Parallel-safe with: 03-money-input, 04-form-primitives (pure UI, no DB)

## How-to
Prisma 7 is already configured — do **not** re-init. `prisma.config.ts`
already reads `DATABASE_URL` from env, sets `migrations.path` to
`prisma/migrations`, and the `prisma-client` generator outputs to
`src/generated/prisma` (gitignored). `prisma/schema.prisma` currently has
only the generator + empty `datasource db { provider = "sqlite" }` blocks.

1. **`.env`** — copy from `.env.example` (which already has
   `DATABASE_URL="file:./dev.db"`). `.env*` is gitignored except the example,
   and `prisma/*.db` is gitignored, so nothing DB-local gets committed.

2. **Add models to `prisma/schema.prisma`** (keep the existing generator +
   datasource blocks):
   ```prisma
   model Person {
     id        String   @id @default(cuid())
     name      String   @unique
     color     String
     createdAt DateTime @default(now())
   }

   model Goal {
     id          String   @id @default(cuid())
     name        String
     targetCents Int
     createdAt   DateTime @default(now())
   }

   model Settings {
     id               Int  @id @default(1)
     rangeStart       Int?
     rangeEnd         Int?
     monthlyGoalCents Int?
   }
   ```

3. **Migrate**: `npx prisma migrate dev --name init-settings` — creates
   `prisma/migrations/*` (commit these — they're NOT gitignored) and
   generates the client into `src/generated/prisma`.

4. **Make `next build` self-sufficient**: the generated client is gitignored,
   so a fresh checkout/worktree has no client until `prisma generate` runs.
   Add to `package.json` scripts: `"postinstall": "prisma generate"`. (A
   fresh `npm install` then regenerates it; the existing `build` script needs
   no change once postinstall exists.)

5. **Add Zod**: `npm install zod` (used by task 02 at the route boundary).

6. **Prisma client singleton** — `src/infra/db/client.ts` (HMR-safe so Next
   dev doesn't leak connections):
   ```ts
   import { PrismaClient } from "@/generated/prisma";

   const store = globalThis as unknown as { prisma?: PrismaClient };
   export const prisma = store.prisma ?? new PrismaClient();
   if (process.env.NODE_ENV !== "production") store.prisma = prisma;
   ```

7. **`core/entities`** — framework-free domain types (no Prisma imports):
   - `src/core/entities/person.entity.ts` → `export type Person = { id: string; name: string; color: string; createdAt: Date }`
   - `src/core/entities/goal.entity.ts` → `Goal = { id; name; targetCents; createdAt }`
   - `src/core/entities/settings.entity.ts` → `Settings = { rangeStart: number | null; rangeEnd: number | null; monthlyGoalCents: number | null }`

8. **`core/repositories`** — narrow interface per entity (ISP), no
   implementation:
   - `person.repository.ts` → `PersonRepository { list(): Promise<Person[]>; create(input: { name: string; color: string }): Promise<Person>; delete(id: string): Promise<void> }`
   - `goal.repository.ts` → `GoalRepository { list(): Promise<Goal[]>; create(input: { name: string; targetCents: number }): Promise<Goal>; delete(id: string): Promise<void> }`
   - `settings.repository.ts` → `SettingsRepository { get(): Promise<Settings>; save(patch: Partial<Settings>): Promise<Settings> }`

9. **`infra/repositories`** — Prisma implementations importing the singleton
   from step 6 and implementing the step-8 interfaces:
   - `person.prisma.repository.ts` — `list` ordered by `createdAt` asc;
     `create`; `delete`.
   - `goal.prisma.repository.ts` — same shape.
   - `settings.prisma.repository.ts` — `get`: `upsert` the row `where: { id: 1 }`
     (`create: { id: 1 }`, `update: {}`) then map to the entity (default the
     three fields to `null`); `save(patch)`: `upsert` `where: { id: 1 }` with
     `create: { id: 1, ...patch }` / `update: patch`, returning the mapped
     entity. Export each as a ready singleton object (e.g.
     `export const settingsRepository: SettingsRepository = { ... }`) so
     services in task 02 wire them by plain import — no DI framework.

Respect the **100-line-per-file cap** (Biome `noExcessiveLinesPerFile`) — one
file per entity/interface/impl keeps each tiny. `core/` must never import
`infra/`, `app/`, or the Prisma client. Match the repo's naming: entities
`*.entity.ts`, repository interfaces `*.repository.ts`, impls
`*.prisma.repository.ts`.

**No service test needed here** (repositories are thin Prisma passthroughs —
`.squad/ARCHITECTURE.md` scopes tests to non-trivial hooks/services). The
delta/money logic that does get tested lives in later tasks.

## Verification
- `npx prisma migrate dev --name init-settings` succeeds and creates a migration.
- `npx prisma generate` succeeds (client appears in `src/generated/prisma`).
- `npm run lint` — Biome all-green (no file over 100 lines, imports organized).
- `npm run build` — `next build` compiles with the generated client and new imports.
- (No `npm run test` additions in this task; it must still pass unchanged.)
