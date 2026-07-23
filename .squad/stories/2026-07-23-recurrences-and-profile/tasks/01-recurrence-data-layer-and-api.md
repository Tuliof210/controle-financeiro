# Recurrence data layer + `/api/recurrences` CRUD (backend)

## Description
Create the full backend for a `Recurrence` entity, mirroring the existing
People/Goals stack exactly. No UI in this task. A recurrence is a recurring
planned income/expense owned by a Person, active over a month sub-period.

Fields: `name` (string), `valueCents` (int cents), `type` (`"income"` |
`"expense"`), `ownerId` (FK → Person), `rangeStart` / `rangeEnd` (int `YYYYMM`,
the active sub-period), `createdAt`. This is the project's **first Prisma
relation** (Recurrence.owner → Person), so `Person` also gains a back-relation.

## When to run
- Depends on: none
- Parallel-safe with: tasks/02-profile-context-and-header-selector.md

## How-to

**Reference implementation to copy line-for-line:** the People stack
(`prisma/schema.prisma`, `src/core/entities/person.entity.ts`,
`src/core/repositories/person.repository.ts`,
`src/infra/repositories/person.prisma.repository.ts`,
`src/app/api/people/{route.ts,service.ts}`) and the Goals stack for the money
field + `service.test.ts` (`src/app/api/goals/service.test.ts`).

### 1. Prisma schema — `prisma/schema.prisma`
Add the model and the back-relation on `Person`:
```prisma
model Person {
  id          String   @id @default(cuid())
  name        String   @unique
  color       String
  createdAt   DateTime @default(now())
  recurrences Recurrence[]           // NEW back-relation
}

model Recurrence {
  id         String   @id @default(cuid())
  name       String
  valueCents Int
  type       String                    // "income" | "expense" (validated by Zod)
  owner      Person   @relation(fields: [ownerId], references: [id])
  ownerId    String
  rangeStart Int                        // YYYYMM
  rangeEnd   Int                        // YYYYMM
  createdAt  DateTime @default(now())
}
```
No Prisma enums (the codebase has none) — `type` is a `String` constrained by
`z.enum` at the route boundary, exactly like `color: z.enum(PALETTE)`.

Author the migration (from the worktree, after `npm install`):
`npx prisma migrate dev --name add_recurrences` — commit the generated
`prisma/migrations/<ts>_add_recurrences/` folder. Then `npm run db:setup`
(= `prisma migrate deploy`) must apply cleanly on a fresh DB. **Run
`prisma generate` / `npm install` in the worktree first** — the generated
client lives in `src/generated/prisma` and node_modules/DB are not shared
across worktrees (see learnings).

### 2. Entity — `src/core/entities/recurrence.entity.ts`
Plain TS type mirroring the row (copy `person.entity.ts` shape):
```ts
export type Recurrence = {
  id: string;
  name: string;
  valueCents: number;
  type: "income" | "expense";
  ownerId: string;
  rangeStart: number;
  rangeEnd: number;
  createdAt: Date;
};
```
Also add a `const RECURRENCE_TYPES = ["income", "expense"] as const` in
`src/lib/recurrence-types.ts` (mirror `src/lib/palette.ts`) so both the Zod
schema and the frontend import the same tuple.

### 3. Repository interface — `src/core/repositories/recurrence.repository.ts`
Copy `person.repository.ts`; `create`/`update` take the input WITHOUT `id`:
```ts
export type RecurrenceInput = {
  name: string; valueCents: number; type: "income" | "expense";
  ownerId: string; rangeStart: number; rangeEnd: number;
};
export type RecurrenceRepository = {
  list(): Promise<Recurrence[]>;
  create(input: RecurrenceInput): Promise<Recurrence>;
  update(id: string, patch: RecurrenceInput): Promise<Recurrence>;
  delete(id: string): Promise<void>;
};
```

### 4. Prisma impl — `src/infra/repositories/recurrence.prisma.repository.ts`
Copy `person.prisma.repository.ts` verbatim, swap `prisma.person` →
`prisma.recurrence`, keep `orderBy: { createdAt: "asc" }`, only `delete` is
`async`. Import `prisma` from `@/infra/db/client`.

### 5. API — `src/app/api/recurrences/route.ts` + `service.ts` + `service.test.ts`
Copy `src/app/api/goals/route.ts` (it has the money field + no unique
constraint, so no `P2002` handling needed). Schema:
```ts
const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  valueCents: z.number().int().min(1),
  type: z.enum(RECURRENCE_TYPES),
  ownerId: z.string().min(1),
  rangeStart: z.number().int(),
  rangeEnd: z.number().int(),
}).refine((v) => v.rangeStart <= v.rangeEnd, {
  message: "Período inválido", path: ["rangeEnd"],
});
const updateSchema = z.object({ /* same fields */ }).extend({ id: z.string().min(1) })
  .refine(/* same start<=end */);
```
(Because `.refine` returns a `ZodEffects`, `updateSchema` can't use
`createSchema.extend` — redeclare the object then `.extend({id}).refine(...)`,
or extract the raw shape. Keep each file ≤100 lines; if `route.ts` gets tight,
that's fine — it mirrors goals.)
- `GET` → `ok(await listRecurrences())`.
- `POST` → validate, `ok(await createRecurrence(parsed.data), 201)`. A bad
  `ownerId` (FK miss) surfaces as a Prisma error — map it: `P2003`
  (foreign-key constraint) → `fail("Pessoa não encontrada", "not_found", 404)`.
- `PUT` → validate, map `P2025`→404 `"Recorrência não encontrada"`,
  `P2003`→404.
- `DELETE` → `?id=` query param (NOT a `[id]` route — this codebase has none),
  map `P2025`→404.
- Use `ok`/`fail`/`safeJson` from `@/lib/http`.

`service.ts` — thin wrappers wiring `recurrenceRepository` (copy
`goals/service.ts`, split `id` off in `updateRecurrence`).

`service.test.ts` — copy `goals/service.test.ts`: `vi.mock` the repository,
assert each service delegates correctly (incl. `updateRecurrence` splitting
`id` from the patch).

### Verification
- `npm install && npx prisma generate` (worktree), then
  `npx prisma migrate dev --name add_recurrences` and `npm run db:setup`.
- `npm test` — new `service.test.ts` green.
- `npm run lint` clean. `npm run build` succeeds.
- Manual smoke (learnings: route.ts logic is untested): POST a valid recurrence,
  POST with a non-existent `ownerId` (expect 404), POST with `rangeStart >
  rangeEnd` (expect 422), DELETE a missing id (expect 404), send an empty body
  (expect 422, not a crash — `safeJson` guards this).
