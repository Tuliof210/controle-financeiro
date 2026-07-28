# Record an OFX import and its movements in one transaction

## Outcome
- `POST /api/ofx-imports` writes N movements and one import record atomically: either
  every row lands and the file is marked imported, or nothing is written at all.
- A second POST carrying a `fileHash` already recorded is refused with a 409, without
  writing anything.
- `GET /api/ofx-imports?hash=<sha256>` answers whether that file was already imported.

## Context
- **New Prisma model.** No foreign key on purpose — the owner declined an undo feature,
  so nothing links a movement back to its import, and `.squad/learnings.md` warns a new
  relation FK defaults to `ON DELETE RESTRICT` and breaks a sibling delete handler. Keep
  it free-standing:
  `model OfxImport { id String @id @default(cuid()); fileHash String @unique; fileName String; importedAt DateTime @default(now()) }`
- **Imitate** `prisma/migrations/20260724190913_add_movements/migration.sql` for SQL
  style — `-- CreateTable` header, double-quoted identifiers, inline PK. The unique
  index style is `CREATE UNIQUE INDEX "OfxImport_fileHash_key" ON "OfxImport"("fileHash");`
  (see `20260722152226_init_settings`, `"Person_name_key"`).
- **Imitate** `src/infra/repositories/movement.prisma.repository.ts` — the whole file is
  the shape: `export const movementRepository: MovementRepository = { list() {...}, create(input) {...} }`,
  an object literal typed by the `core/` interface, no class, no factory. Client is
  `import { prisma } from "@/infra/db/client";` (note `src/infra/db/`, not `src/lib/`).
- **Reuse** `MovementInput` from `src/core/repositories/movement.repository.ts`, verbatim:
  `{ name: string; valueCents: number; type: EntryType; ownerId: string; month: number }`.
- **Reuse** `ok`, `fail`, `safeJson` from `src/lib/http.ts`:
  `ok = <T>(data: T, status = 200)`, `fail = (message: string, code: string, status = 400)`,
  `safeJson(request: Request): Promise<unknown>`.
- **Imitate** the Zod idiom in `src/app/api/movements/route.ts` and copy its bounds
  verbatim into the per-item schema — they are load-bearing, not decoration:
  ```ts
  name: z.string().trim().min(1).max(80),
  valueCents: z.number().int().min(1),
  type: z.enum(ENTRY_TYPES),
  month: z.number().int().min(200001).max(209912),
  ```
  and the parse idiom: `const parsed = schema.safeParse(await safeJson(request)); if (!parsed.success) return fail("Dados inválidos", "validation", 422);`
- **Imitate** `src/app/api/dashboard/route.ts:10-14` for the GET query param — the only
  parameterised GET in this API, deliberately without Zod:
  `const owner = request.nextUrl.searchParams.get("owner"); if (!owner) return fail("Dados inválidos", "validation", 422);`
- **Watch out for** `$transaction`: nothing in this repo uses one yet — you are writing
  the first. The adapter is `@prisma/adapter-better-sqlite3`; verify the interactive
  form actually rolls back rather than assuming it does.
- **Watch out for** the `month` bound. `derivePeriod` in `src/core/use-cases/period.service.ts`
  does `Math.min(...months)` over every movement, and the dashboard feeds that into
  `buildMonths`, which enumerates each month in a `while` loop. One row with a
  mis-parsed year hangs every dashboard request — the `200001..209912` bound is the only
  thing standing between the two.
- **Watch out for** the missing body-size guard: `next.config.ts` sets no limit for Route
  Handlers (`src/app/api/ofx/route.ts:5-6` says so). Cap the array at 480 items — the OFX
  reader's own `MAX_SPAN = 240` months in `src/app/api/ofx/period.helper.ts`, times the
  two rows a month can produce.
- **Watch out for** `P2003` on a bad `ownerId` — `src/app/api/movements/route.ts:43-48`
  maps it to `fail("Pessoa não encontrada", "not_found", 404)`; do the same.

## Scope
- In: `prisma/schema.prisma`, a new folder under `prisma/migrations/`,
  `src/core/entities/ofx-import.entity.ts`, `src/core/repositories/ofx-import.repository.ts`,
  `src/infra/repositories/ofx-import.prisma.repository.ts`,
  `src/app/api/ofx-imports/{route.ts,service.ts}`, the `db:clean` script in `package.json`
- Out: everything under `src/app/leitor-ofx/`, `src/app/api/ofx/`, and
  `src/app/api/movements/` — the existing single-movement route keeps working unchanged

## Contract
Request body of `POST /api/ofx-imports` — `ownerId` is top-level because one import has
exactly one owner:
```ts
{ fileHash: string; fileName: string; ownerId: string;
  movements: { name: string; valueCents: number; type: EntryType; month: number }[] }
```
Responses: `201 { data: { imported: number } }` · `409 { error: { message, code: "already_imported" } }`
GET: `200 { data: { imported: boolean; importedAt: string | null } }`

## Verify
- `npx prisma migrate dev --name add_ofx_imports` then `npm run db:setup`, and confirm
  `sqlite3 dev.db ".schema OfxImport"` prints the unique index.
- With the dev server running, POST a two-item batch, then re-POST the same `fileHash`
  and confirm the second answers 409 **and** that `sqlite3 dev.db "SELECT COUNT(*) FROM Movement"`
  did not grow.
- Prove the rollback: POST a batch whose last item carries a non-existent `ownerId`, then
  confirm both `Movement` and `OfxImport` counts are unchanged.
- `npm run lint` && `npm run build` — the build is the only typecheck in this repo, and
  `src/generated/prisma` is gitignored, so `prisma generate` must have run first.
- `wc -l` every file you created or touched.

## Forbidden
- Do not add a foreign key from `OfxImport` to `Movement` or `Person`.
- Do not import `prisma` from `service.ts` or `route.ts` — the service talks to the
  `core/repositories` interface, and `core/` never imports `infra/`.
- Do not touch `src/app/api/ofx/` — that route is documented as pure and DB-free, and
  the next task depends on it staying that way.
- Do not loosen or omit any bound copied from `movementShape`, and do not let the array
  arrive uncapped.
