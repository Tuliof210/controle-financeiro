# Shared ownership helpers — generic visibleFor/splitByType + FAMILY_PROFILE + resolveOwnerId

## Description
`visibleFor` and `splitByType` are duplicated (identical logic, differ only by
entity type) between the recurrences and movements features; the
profile-or-first-person `defaultOwnerId` expression is duplicated in both form
hooks; and the `"familia"` sentinel is hard-coded in several places.
Consolidate into generics + a shared constant.

Inventory (all on `main`):
- `visibleFor`/`splitByType`:
  `src/app/recorrencias/_components/RecurrencesScreen/recurrences.helper.ts:5,11`
  and `src/app/movimentacoes/_components/MovementsScreen/movements.helper.ts:5,11`
  (identical bodies; only the entity annotation differs). Consumed as
  `splitByType(visibleFor(items, profile))` in both screen hooks (`:43`).
- `defaultOwnerId` (byte-identical) at `RecurrenceForm/hook.ts:33-35` and
  `MovementForm/hook.ts:32-34`.
- `"familia"` sentinel hard-coded at `ProfileProvider/hook.ts:27,60`,
  `ProfileProvider/profile.helper.ts:4,11`, and both feature helpers' `visibleFor`.

## When to run
- Depends on: 01 (uses `EntryType`), and run after 02 (sequential — see 01's note)
- Parallel-safe with: none

## How-to
1. Create `src/lib/ownership.ts`:
   ```ts
   import type { EntryType } from "@/lib/entry-types";

   // The ProfileProvider sentinel meaning "show every owner".
   export const FAMILY_PROFILE = "familia";

   export function visibleFor<T extends { ownerId: string }>(
     all: T[],
     profile: string,
   ): T[] {
     return profile === FAMILY_PROFILE
       ? all
       : all.filter((item) => item.ownerId === profile);
   }

   export function splitByType<T extends { type: EntryType }>(items: T[]) {
     return {
       income: items.filter((item) => item.type === "income"),
       expense: items.filter((item) => item.type === "expense"),
     };
   }
   ```
   Both `Recurrence` and `Movement` satisfy the `{ ownerId }` / `{ type }`
   constraints. Verify `splitByType`'s inferred return type stays clean at both
   call sites (`RecurrencesScreen/hook.ts:43`, `MovementsScreen/hook.ts:43`) —
   it becomes `{ income: T[]; expense: T[] }`, which is what they already use.
2. Update the two screen hooks to import `visibleFor`/`splitByType` from
   `@/lib/ownership`; **delete** `recurrences.helper.ts` and `movements.helper.ts`.
3. Merge their tests into `src/lib/ownership.test.ts` (the two existing
   `*.helper.test.ts` are mirror suites — keep one set of assertions, exercised
   against a tiny inline `{ id, ownerId, type }` fixture so the test doesn't
   depend on a specific entity). Delete `recurrences.helper.test.ts` and
   `movements.helper.test.ts`.
4. Add `resolveOwnerId` to `src/lib/ownership.ts` (or, if you prefer co-location
   with the related `isStaleProfile`, to `ProfileProvider/profile.helper.ts` —
   pick one and note it; `src/lib/ownership.ts` keeps all ownership concerns
   together and matches the "shared helpers in lib" decision):
   ```ts
   import type { Person } from "@/core/entities/person.entity";
   // Default owner for a new entry: the active profile if it's a real person,
   // else the first person (or "" when there are none).
   export function resolveOwnerId(profile: string, people: Person[]): string {
     return people.some((person) => person.id === profile)
       ? profile
       : (people[0]?.id ?? "");
   }
   ```
   Replace the inline `defaultOwnerId` expression in `RecurrenceForm/hook.ts` and
   `MovementForm/hook.ts` with `const defaultOwnerId = resolveOwnerId(profile, people);`.
5. Adopt `FAMILY_PROFILE` where `"familia"` is hard-coded: `ProfileProvider/hook.ts`
   (default state + the stale-reset fallback) and `ProfileProvider/profile.helper.ts`
   (`resolveLabel`/`isStaleProfile`). Import from `@/lib/ownership`. (Behavior
   identical — just replaces the magic string.)
6. Grep to confirm no remaining `recurrences.helper`/`movements.helper` imports,
   no stray inline `defaultOwnerId` expression, and no bare `"familia"` literal
   outside `FAMILY_PROFILE`'s definition.

## Risks / notes
- This is a **genericization**, not a pure move — the only semantic thing to
  watch is `splitByType`'s inferred return type at the call sites; the `build`
  (tsc) will catch any inference regression.
- `src/lib/ownership.ts` importing `import type { EntryType }` and
  `import type { Person }` is type-only (erased at runtime) — layering-clean.

## Verification
```
npm run lint
npm run test
npm run build
```
All green; `npm run test` runs `ownership.test.ts`. Manual smoke (`npm run dev`):
on both Recorrências and Movimentações, switching the header profile between
"Família" and a person still filters the two sections correctly, and a new
entry's Responsável still defaults to the active profile.
