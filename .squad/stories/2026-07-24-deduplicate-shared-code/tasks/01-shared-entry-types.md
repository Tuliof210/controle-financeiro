# Shared entry-types (ENTRY_TYPES / EntryType / TYPE_LABELS / SELECTED_VARIANT)

## Description
`income`/`expense` is expressed in six duplicated places. Consolidate into one
`src/lib/entry-types.ts` and delete the two per-feature type files. Pure
constants + a type alias — behavior-preserving, lowest-risk of the story.

Inventory (all on `main`):
- `src/lib/recurrence-types.ts:1` — `RECURRENCE_TYPES = ["income","expense"] as const`
- `src/lib/movement-types.ts:1` — `MOVEMENT_TYPES = ["income","expense"] as const`
- inline `type: "income" | "expense"` at: `src/core/entities/recurrence.entity.ts:5`,
  `src/core/entities/movement.entity.ts:5`,
  `src/core/repositories/recurrence.repository.ts:6`,
  `src/core/repositories/movement.repository.ts:6`
- inline UI const pairs (byte-identical) at
  `src/app/recorrencias/_components/RecurrencesScreen/components/RecurrenceForm/index.tsx:11-12`
  and `src/app/movimentacoes/_components/MovementsScreen/components/MovementForm/index.tsx:11-12`:
  `TYPE_LABELS = { income: "Entrada", expense: "Saída" }`,
  `SELECTED_VARIANT = { income: "success", expense: "danger" }`.

## When to run
- Depends on: none
- Parallel-safe with: none. Tasks 01–03 all edit the recurrence/movement forms,
  entities, and routes — run them sequentially (each branches from the prior's
  merged main) to avoid conflicts. Recommended order: 01 → 02 → 03.

## How-to
1. Create `src/lib/entry-types.ts` (bare lib naming, matching `recurrence-types.ts`):
   ```ts
   export const ENTRY_TYPES = ["income", "expense"] as const;
   export type EntryType = (typeof ENTRY_TYPES)[number];

   // Shared UI mappings for the Entrada/Saída type of an entry.
   export const TYPE_LABELS: Record<EntryType, string> = {
     income: "Entrada",
     expense: "Saída",
   };
   export const SELECTED_VARIANT = {
     income: "success",
     expense: "danger",
   } as const;
   ```
   Keep `ENTRY_TYPES` a `readonly ["income","expense"]` tuple (`as const`) — both
   routes pass it to `z.enum(...)`, which needs the tuple, not `string[]`.
2. Replace the two constants:
   - `src/app/api/recurrences/route.ts:5,16` — import `ENTRY_TYPES` from
     `@/lib/entry-types`, `z.enum(ENTRY_TYPES)`.
   - `src/app/api/movements/route.ts:5,16` — same.
   - Delete `src/lib/recurrence-types.ts` and `src/lib/movement-types.ts`.
3. Replace the inline unions with `EntryType` (import type):
   - `src/core/entities/recurrence.entity.ts:5`,
     `src/core/entities/movement.entity.ts:5`,
     `src/core/repositories/recurrence.repository.ts:6`,
     `src/core/repositories/movement.repository.ts:6` →
     `type: EntryType;` with `import type { EntryType } from "@/lib/entry-types";`.
     (`core/entities` doing a **type-only** import from `src/lib` is allowed — the
     dependency rule only forbids `core → infra`/`core → app`, and `import type`
     erases at runtime.)
4. Replace the inline UI const pairs:
   - In both `RecurrenceForm/index.tsx` and `MovementForm/index.tsx`, delete the
     local `TYPE_LABELS`/`SELECTED_VARIANT` and import them from
     `@/lib/entry-types`. Also swap the `RECURRENCE_TYPES`/`MOVEMENT_TYPES`
     import used by the `.map(...)` toggle for `ENTRY_TYPES`.
5. Grep to confirm no `RECURRENCE_TYPES`/`MOVEMENT_TYPES`/`recurrence-types`/
   `movement-types` references remain, and no stray inline `"income" | "expense"`
   union in the touched entities/repositories.

## Verification
```
npm run lint
npm run test
npm run build
```
All green. `noExcessiveLinesPerFile` (Biome, maxLines 100) — the forms lose two
const lines each, so they only shrink. The Zod `z.enum` behavior is identical
(same tuple). No test changes expected (the service tests use `"income" as const`
fixtures, still valid). Quick manual smoke: `npm run dev`, confirm the
Entrada/Saída toggles on both Recorrências and Movimentações still render green/
red and the APIs still reject an out-of-enum `type` (422).
