# A recurrence knows whether it is fixed or an installment

## Outcome
- `POST /api/recurrences` accepts `kind: "fixed" | "installment"` and an
  optional `totalCents`; `GET` returns both on every row.
- The five recurrences already in `dev.db` read back as `kind: "fixed"` with
  `totalCents: null`, and every dashboard figure is byte-identical to before.
- `kind` is absent from a request body → the row is `"fixed"`, so the existing
  e2e seed keeps working untouched.

## Context

- **The literal-union convention.** There is no Prisma enum: the column is
  `String` and `z.enum` guards it at the route. `kind` gets the identical
  treatment as `type`. The cast to clone, verbatim from
  `src/infra/repositories/recurrence.prisma.repository.ts:5-28`:

  ```ts
  type RecurrenceRow = { id: string; name: string; valueCents: number;
    type: string; ownerId: string; createdAt: Date; months: { month: number }[] };

  // ponytail: Prisma has no enum for `type` (project convention — see schema
  // comment), so a row sees `string`, not the domain union. Zod already guards
  // it at the route boundary, so the narrowing cast here is safe.
  function toEntity(row: RecurrenceRow): Recurrence {
    ...
    type: row.type as Recurrence["type"],
  ```

  **`RecurrenceRow` is hand-written, not `Prisma.RecurrenceGetPayload`.** A row
  carrying an extra `kind` is still assignable to the narrower type, so
  forgetting to add `kind` here surfaces only as an error on the return type —
  and "fixing" that with a cast ships `kind: undefined` on every GET, which
  silently empties task 02's filter. Do NOT copy
  `movement.prisma.repository.ts`, which casts the whole promise
  (`as Promise<Movement[]>`) and would suppress the error entirely.

- **Reuse** the entry-type precedent in `src/lib/entry-types.ts`:
  `export const ENTRY_TYPES = ["income", "expense"] as const;` plus
  `export type EntryType = (typeof ENTRY_TYPES)[number];`. A sibling
  `RECURRENCE_KINDS = ["fixed", "installment"] as const` belongs in the same
  file or its own `src/lib/recurrence-kinds.ts`; the Zod shape then uses
  `z.enum(RECURRENCE_KINDS).default("fixed")`.

- **The blind spread.** `recurrence.prisma.repository.ts:40-46` is
  `data: { ...fields, months: { create: monthRows(months) } }` — every field on
  `RecurrenceInput` flows straight to Prisma with no whitelist. A field added
  to the Zod shape but not to `schema.prisma` throws
  `PrismaClientValidationError`, which `POST` does not catch (it only maps
  `P2003`), so it escapes as a bare 500 outside the `{ error }` envelope. Add
  the column and the input field in the same commit.

- **`route.ts` is 96 lines against a 100 cap.** `recurrenceShape` (lines 13-25)
  plus `createSchema`/`updateSchema` must move to a sibling
  `recurrence-schema.helper.ts`; two new fields do not fit in place.

- **Migration.** This repo has NO `ALTER TABLE ADD COLUMN` precedent — all six
  migrations are `CREATE TABLE` or a full `RedefineTables` rebuild. Do not
  assume the shape: run `npx prisma migrate dev --create-only --name
  recurrence_kind`, then **read `migration.sql` before applying it**. If it
  came out as a rebuild, `PRAGMA defer_foreign_keys=ON; PRAGMA
  foreign_keys=OFF;` must survive verbatim — `RecurrenceMonth.recurrenceId` is
  `ON DELETE CASCADE`, so a rebuild without them drops all 76 month rows in
  `dev.db` permanently. Back `dev.db` up before applying either way.

- **`totalCents` is nullable and never used in arithmetic here.** It is the
  price the owner typed; `valueCents` stays the per-month figure the projection
  reads. They do not reconcile — `series.helper.ts` adds `valueCents` once per
  active month, so `totalCents` is display-only. Say so where the field is
  declared.

- **Watch out for** `src/generated/prisma` being gitignored: after editing the
  schema, `npm run db:postinstall` (= `prisma generate`) must run or
  `@/generated/prisma` has no `kind` and the type errors are misleading.

## Scope
- In: `prisma/schema.prisma`, `prisma/migrations/<new>/`,
  `src/core/entities/recurrence.entity.ts`,
  `src/core/repositories/recurrence.repository.ts`,
  `src/infra/repositories/recurrence.prisma.repository.ts`,
  `src/app/api/recurrences/route.ts` + a new schema helper beside it,
  `src/lib/` for the kind constant.
- Out: every `.tsx`, `src/app/api/dashboard/**`, `src/core/use-cases/period.service.ts`,
  `e2e/**`. This task changes no behaviour any screen can see.

## Verify
- `npm run db:setup`, then `npm run lint` and `npx tsc --noEmit`.
- Before applying the migration, capture the baseline: `npm run dev` and
  `curl -s 'http://localhost:3000/api/dashboard?owner=familia' | jq -S '.data' > /tmp/before.json`.
  After it, the same command into `/tmp/after.json`; `diff` them — must be empty.
- `curl -s http://localhost:3000/api/recurrences | jq '.data[] | {name, kind, totalCents}'`
  — all five rows `"fixed"`, `null`.
- POST one installment with `kind: "installment"`, `totalCents: 299900`,
  `valueCents: 49984`, 6 months, and GET it back unchanged. Then POST a body
  with no `kind` at all and confirm it lands as `"fixed"` (this is what keeps
  `e2e/seed.helper.ts` valid).
- `wc -l` every touched file.

## Forbidden
- A `kind` filter at, or below, `listRecurrences()`. That method is shared with
  `/api/dashboard` and `/api/period`; filtering there silently changes the
  projection and the derived range. Filtering is task 02's job, client-side.
- Making `kind` required on the wire — the e2e seed omits it on three POSTs.
- Deriving, validating or reconciling `totalCents` against `valueCents * N`
  here. The form owns that arithmetic; the API stores what it is given.
- `Prisma.RecurrenceGetPayload` or a promise-level cast in the repository.
