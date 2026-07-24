# Shared month toolkit — all YYYYMM utils in src/lib/months.ts

## Description
Consolidate every YYYYMM helper into one `src/lib/months.ts`, eliminating the
duplicated `buildMonths` (×2) and `formatYyyymm` (×3) and moving the codec out
of the `MonthPicker` component folder (a generic util currently living in a
component). Everything imports from one leaf module — no `lib → components`
inversion, no cross-feature helper imports.

Inventory (all on `main`):
- **Codec (single-sourced today, move as-is)** —
  `src/components/MonthPicker/month.helper.ts`: `MONTH_LABELS`, `splitYYYYMM`,
  `composeYYYYMM`, `currentYYYYMM`, `yearOptions`.
- **`buildMonths` — 2 byte-identical copies:**
  `src/app/recorrencias/_components/RecurrencesScreen/components/RecurrenceForm/components/MonthRangeSlider/months.helper.ts:9`
  and `src/app/movimentacoes/_components/MovementsScreen/components/MovementForm/month.helper.ts:15`.
- **`formatYyyymm` — 3 copies, ONE differs:**
  - `RecurrencesScreen/recurrence-range.helper.ts:7` — `(value: number)`
  - `MovementForm/month.helper.ts:32` — `(value: number)` (byte-identical to above)
  - `SettingsScreen/components/RangeSection/range.helper.ts:4` —
    `(value: number | null)`, returns `"—"` when null. **This null branch is
    load-bearing** (`RangeSection/index.tsx:36` can pass a null bound).

## When to run
- Depends on: 01 (branch from main after 01 merges to avoid form-file conflicts)
- Parallel-safe with: none (see 01's note; run 01 → 02 → 03 sequentially)

## How-to
1. Create `src/lib/months.ts` containing the full toolkit (bare lib naming):
   - Move `MONTH_LABELS`, `splitYYYYMM`, `composeYYYYMM`, `currentYYYYMM`,
     `yearOptions` verbatim from `MonthPicker/month.helper.ts`.
   - Add `buildMonths` verbatim (either copy — they're identical).
   - Add `formatYyyymm` using the **`number | null` superset signature** (adopt
     the RangeSection variant — it's a strict superset; number-only callers keep
     identical behavior):
     ```ts
     export function formatYyyymm(value: number | null): string {
       if (value == null) return "—";
       const year = Math.trunc(value / 100);
       const month = value % 100;
       return `${MONTH_LABELS[month - 1]}/${String(year % 100).padStart(2, "0")}`;
     }
     ```
   File stays well under the 100-line cap (~50 lines).
2. Delete `src/components/MonthPicker/month.helper.ts`, the two `buildMonths`
   copies' host files where they hold *only* `buildMonths`
   (`MonthRangeSlider/months.helper.ts` — delete; `MovementForm/month.helper.ts`
   — delete, since it held only buildMonths+formatYyyymm), and the standalone
   `formatYyyymm` in `RangeSection/range.helper.ts` (delete the function; if the
   file becomes empty, delete it — check it holds nothing else).
   - `recurrence-range.helper.ts` KEEPS `formatMonths` (recurrence-specific
     multi-month display) — just delete its local `formatYyyymm` and import it
     from `@/lib/months` instead.
3. Repoint every importer to `@/lib/months`:
   - Codec importers of `@/components/MonthPicker/month.helper`: `MonthPicker`'s
     own `index.tsx`/`hook.ts`, `recurrence-range.helper.ts`, `range.helper.ts`,
     `MonthRangeSlider/months.helper.ts`(gone)/`hook.ts`,
     `RecurrenceForm/intervals.helper.ts`, `RecurrenceForm/hook.ts`,
     `MovementForm/hook.ts`, `MovementForm/index.tsx`, `MovementRow/index.tsx`,
     and any test files. Grep `@/components/MonthPicker/month.helper` and
     `./month.helper`/`./months.helper` to catch them all.
   - `buildMonths` importers: `RecurrenceForm/hook.ts:47`,
     `RecurrenceForm/intervals.helper.ts:22`, `MovementForm/hook.ts:49`.
   - `formatYyyymm` importers: `MonthRangeSlider/hook.ts:31-32`,
     `recurrence-range.helper.ts` (formatMonths), `RangeSection/index.tsx:36`,
     `MovementForm/index.tsx:90`, `MovementRow/index.tsx:33`.
4. Merge the tests into one `src/lib/months.test.ts` (colocated with the source
   per repo convention — tests live next to their file):
   - Keep `buildMonths` cases (inclusive range, year wrap, single month,
     start>end → []).
   - Keep `formatYyyymm` numeric cases (`202501 → "Jan/25"`, `202608 → "Ago/26"`)
     **and the null case `formatYyyymm(null) → "—"`** (from
     `RangeSection/range.helper.test.ts:10-12` — must survive).
   - Delete the now-orphaned test files: `MonthRangeSlider/months.helper.test.ts`,
     `MovementForm/month.helper.test.ts`, and the `formatYyyymm` describe in
     `range.helper.test.ts` (keep any non-`formatYyyymm` tests there). Leave
     `recurrence-range.helper.test.ts`'s `formatMonths` describe intact (it now
     imports `formatYyyymm` transitively via the source).

## Risks / notes
- **Only `formatYyyymm` is not a pure copy** — reconciled by the `number | null`
  superset above. `buildMonths` and the codec are byte-identical moves.
- `MonthPicker/month.helper.ts` is a **leaf** (imports nothing), so moving it to
  `src/lib/months.ts` creates no cycle; `MonthPicker`'s component files then
  import from `@/lib/months` (`components → lib`, correct layering).
- Do NOT change `formatMonths` (recurrence-only) or `MonthRangeSlider`'s own
  `"—"` guard — both keep working against the widened signature.

## Verification
```
npm run lint
npm run test
npm run build
```
All green; `npm run test` runs the merged `months.test.ts`. Grep confirms zero
remaining `buildMonths`/`formatYyyymm` definitions outside `src/lib/months.ts`,
and no references to `MonthPicker/month.helper`. Manual smoke (`npm run dev`):
Recorrências slider labels ("Ago/26"), Movimentações month select + row month,
and Configurações Range display all still render correctly (and Range still
shows "—" when a bound is unset).
