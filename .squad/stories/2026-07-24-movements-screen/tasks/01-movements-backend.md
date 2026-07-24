# Movements backend — model, migration, entity/repository, /api/movements

## Description
Add the `Movement` domain end-to-end on the server, mirroring the existing
`Recurrence` backend but with a **single `month` (YYYYMM int) scalar column**
instead of the `RecurrenceMonth` child table. No UI in this task — the
`/movimentacoes` page stays a stub, so nothing is user-visible yet and nothing
breaks. This slice is an independently mergeable PR.

A `Movement` is `{ id, name, valueCents, type: "income"|"expense", ownerId,
month, createdAt }`. It reuses the same shared HTTP/api/Zod plumbing as
recurrences.

## When to run
- Depends on: none
- Parallel-safe with: none (task 02 depends on this)

## How-to

### A. Prisma schema + migration
`prisma/schema.prisma` (datasource sqlite; client generated to
`../src/generated/prisma`; `Person` at :15-21, `Recurrence` at :30-39).

1. Add a back-relation to `Person` and a new `Movement` model:
   ```prisma
   model Person {
     id          String       @id @default(cuid())
     name        String       @unique
     color       String
     createdAt   DateTime     @default(now())
     recurrences Recurrence[]
     movements   Movement[]
   }

   model Movement {
     id         String   @id @default(cuid())
     name       String
     valueCents Int
     type       String
     owner      Person   @relation(fields: [ownerId], references: [id])
     ownerId    String
     month      Int // YYYYMM
     createdAt  DateTime @default(now())

     @@index([month])
   }
   ```
   **No `onDelete` on the owner relation** — mirror `Recurrence.owner`, which
   defaults to `RESTRICT`. Cascade would silently delete a person's financial
   history on person-delete (wrong for a finance app); Restrict correctly forces
   a 409 (see step E). No Prisma enum for `type` (project convention: `String` +
   `z.enum` at the route).

2. Generate the migration and apply it:
   ```
   npx prisma migrate dev --name add_movements --create-only
   npm run db:setup            # prisma migrate deploy
   npx prisma generate         # so @/generated/prisma/client exposes prisma.movement
   ```
   Naming convention (matches existing dirs): `<UTC YYYYMMDDHHMMSS>_add_movements/`.
   This is a plain `CREATE TABLE` + FK + index — no data backfill needed (new
   table). **Fresh-worktree gotcha:** `dev.db` and `src/generated/prisma` are
   gitignored, so run `npx prisma generate` after the schema edit and
   `npm run db:setup` before build/API, or `prisma.movement` won't exist and
   routes 500.

### B. Types const
`src/lib/movement-types.ts` — mirror `src/lib/recurrence-types.ts`:
```ts
export const MOVEMENT_TYPES = ["income", "expense"] as const;
```

### C. Entity + repository interface
- `src/core/entities/movement.entity.ts`:
  ```ts
  export type Movement = {
    id: string;
    name: string;
    valueCents: number;
    type: "income" | "expense";
    ownerId: string;
    month: number; // YYYYMM
    createdAt: Date;
  };
  ```
- `src/core/repositories/movement.repository.ts` (mirror
  `recurrence.repository.ts`):
  ```ts
  import type { Movement } from "@/core/entities/movement.entity";
  export type MovementInput = {
    name: string;
    valueCents: number;
    type: "income" | "expense";
    ownerId: string;
    month: number;
  };
  export type MovementRepository = {
    list(): Promise<Movement[]>;
    create(input: MovementInput): Promise<Movement>;
    update(id: string, patch: MovementInput): Promise<Movement>;
    delete(id: string): Promise<void>;
  };
  ```

### D. Prisma repository
`src/infra/repositories/movement.prisma.repository.ts`. Because `month` is a
scalar (no child table), this is **simpler** than the current recurrence repo —
mirror the ORIGINAL recurrence pattern (`data: input`, one `as` cast for the
literal-union `type`), no `toEntity`/`include`/`deleteMany`:
```ts
import type { Movement } from "@/core/entities/movement.entity";
import type { MovementRepository } from "@/core/repositories/movement.repository";
import { prisma } from "@/infra/db/client";

// ponytail: Prisma has no enum for `type` (project convention), so a row sees
// `string`, not the domain union. Zod guards it at the route boundary, so the
// narrowing cast here is safe.
export const movementRepository: MovementRepository = {
  list() {
    return prisma.movement.findMany({
      orderBy: { createdAt: "asc" },
    }) as Promise<Movement[]>;
  },
  create(input) {
    return prisma.movement.create({ data: input }) as Promise<Movement>;
  },
  update(id, patch) {
    return prisma.movement.update({ where: { id }, data: patch }) as Promise<Movement>;
  },
  async delete(id) {
    await prisma.movement.delete({ where: { id } });
  },
};
```

### E. API route + service + test
`src/app/api/movements/` — mirror `src/app/api/recurrences/{route.ts,service.ts,
service.test.ts}` exactly, swapping the `months` array for a single `month`:
- `route.ts` Zod:
  ```ts
  const movementShape = {
    name: z.string().trim().min(1).max(80),
    valueCents: z.number().int().min(1),
    type: z.enum(MOVEMENT_TYPES),
    ownerId: z.string().min(1),
    month: z.number().int().min(190001).max(999912),
  };
  const createSchema = z.object(movementShape);
  const updateSchema = z.object({ ...movementShape, id: z.string().min(1) });
  ```
  Handlers copy the recurrence route verbatim (same `ok/fail/safeJson` from
  `@/lib/http`, `Prisma` from `@/generated/prisma/client`), only re-wording
  messages: GET catch → "Erro ao carregar movimentações"; POST/PUT `P2003` →
  `fail("Pessoa não encontrada","not_found",404)`; PUT/DELETE `P2025` →
  `fail("Movimentação não encontrada","not_found",404)`; DELETE missing `?id` →
  `fail("Parâmetro id é obrigatório","validation",422)`.
- `service.ts` — 4 one-line delegations to `movementRepository` (mirror
  `recurrences/service.ts`).
- `service.test.ts` — mirror `recurrences/service.test.ts`; the `input` fixture
  uses `month: 202608` (not a `months` array); assert list/create/update/delete
  delegate.

### F. Generalize the people-delete conflict message (required)
`src/app/api/people/route.ts:~83` currently maps `P2003` on person delete to
`fail("Pessoa possui recorrências vinculadas", "conflict", 409)`. With movements
also referencing a person, a person with **movements** would trip the same
`P2003` but show a recorrências-only message. Generalize it, e.g.:
`fail("Pessoa possui registros vinculados", "conflict", 409)`. (Structure is
already correct — Restrict → 409, not 500; only the wording needs widening.)

## Verification
```
npx prisma generate
npm run db:setup
npm run lint
npm run test
npm run build
```
All green. `npm run test` should include the new `movements/service.test.ts`.

Manual smoke tests (route.ts has no automated coverage per repo convention —
tests colocate only with `service.ts`). Run the dev server and `curl`:
- POST empty/malformed body → 422; POST `type` outside income|expense, or
  `valueCents < 1`, or `month` outside 190001..999912 → 422.
- POST/PUT with a non-existent `ownerId` → 404 "Pessoa não encontrada".
- PUT/DELETE a non-existent movement id → 404 "Movimentação não encontrada";
  DELETE without `?id=` → 422.
- Create a person, give them a movement, then `DELETE /api/people?id=<that>` →
  **409** with the new generic message (confirms the Restrict FK + step F).
