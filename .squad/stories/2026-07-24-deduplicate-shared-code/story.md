# Deduplicate shared code (promote to shared modules)

## Description
Sweep the codebase for functions/constants/types that were copied instead of
shared, and promote each to a single shared home. The recurrences and movements
features (plus settings) grew as parallel clones, so several pure helpers and
constants now exist in 2–3 places. Consolidate them, then — as the owner
elected — also unify the near-identical **components** (Row/Section/Screen/Form)
into generics.

An audit (two read-only passes) produced the exact inventory below; every task
carries its findings so no rediscovery is needed.

**Two phases:**
- **Phase 1 — pure helper/constant/type dedup (tasks 01–03).** Behavior-
  preserving promotions with test coverage. High value, low risk. Safe to ship
  regardless of Phase 2.
- **Phase 2 — component generics (tasks 04–05).** Unify the recurrence/movement
  Row/Section/Screen/Form into generic components. **The audit recommends
  caution here:** the styles and structure are byte-identical, but the *period
  control genuinely diverges* (recurrences = `months: number[]` + interval
  sliders; movements = single `month` + a bounded select), so a generic
  `EntryForm` must abstract over the period model. With only two entities this
  is the classic "wait for the third consumer" case. It is included because the
  owner asked for it; it is sequenced last so Phase 1 can ship first and Phase 2
  can be deferred or revised without blocking anything.

**Scope decisions (confirmed with the owner):**
- Run against `main` — it is current (movements backend PR #30 and frontend
  PR #31 are both merged; the full inventory is on `main`).
- Shared pure helpers live in **`src/lib/`** (bare filenames — the lib
  precedent is `api.ts`, `http.ts`, `palette.ts`; the `.helper.ts` suffix is
  for co-located feature helpers only).
- The month/YYYYMM toolkit moves **entirely** to `src/lib/months.ts` (including
  the codec currently in `src/components/MonthPicker/month.helper.ts`), so
  everything imports from one leaf and there is no `lib → components` inversion.

Every promotion is behavior-preserving. This story adds no features, no
migrations, no API contract changes.

## Acceptance Criteria
- [ ] `income`/`expense` live in one shared `src/lib/entry-types.ts`
      (`ENTRY_TYPES`, `EntryType`, `TYPE_LABELS`, `SELECTED_VARIANT`);
      `recurrence-types.ts` and `movement-types.ts` are deleted; the four inline
      `"income" | "expense"` unions use `EntryType`.
- [ ] All YYYYMM utilities (`MONTH_LABELS`, `splitYYYYMM`, `composeYYYYMM`,
      `currentYYYYMM`, `yearOptions`, `buildMonths`, `formatYyyymm`) live only in
      `src/lib/months.ts`; the duplicated `buildMonths` (×2) and `formatYyyymm`
      (×3) copies and `MonthPicker/month.helper.ts` are gone; the null-handling
      of the settings `formatYyyymm(number | null)` is preserved.
- [ ] `visibleFor`/`splitByType` exist once as generics in `src/lib/ownership.ts`
      (with a shared `FAMILY_PROFILE` const); the two feature copies are gone.
      Owner-default logic is a single `resolveOwnerId`.
- [x] (Phase 2) The recurrence/movement Row, Section, Screen, and Form are each
      a single component reused by both features. **Row/Section/Screen are
      generic (task 04). The Form is shared by composition, not by a generic
      (task 05)** — a generic `EntryForm` parameterized over the period was
      built and rejected: `Partial<P>` is opaque while `P` is an unresolved type
      parameter, so the screen could not seed the form without unverifiable
      casts. Sharing the concrete half (name/value/type/owner) and letting each
      form own its period needs no generic and no cast. Decision made with the
      owner mid-task; see task 05's PR for the full evidence.
- [ ] No behavior change anywhere: every existing test still passes unchanged in
      intent, and the recurrences + movements screens work exactly as before
      (verified live).

## Definition of Done
- [ ] `npm run lint`, `npm run test`, and `npm run build` all green after every
      task.
- [ ] Duplicated definitions removed (grep confirms a single source per symbol).
- [ ] Tasks merged (each as its own PR). Phase 2 may be closed as "deferred" by
      the owner without blocking Phase 1.

## Tasks
- [x] tasks/01-shared-entry-types.md — ENTRY_TYPES/EntryType/TYPE_LABELS/SELECTED_VARIANT in src/lib/entry-types.ts
- [x] tasks/02-shared-month-toolkit.md — all YYYYMM utils (incl. buildMonths/formatYyyymm) in src/lib/months.ts
- [x] tasks/03-shared-ownership-helpers.md — generic visibleFor/splitByType + FAMILY_PROFILE + resolveOwnerId
- [x] tasks/04-generic-row-section-screen.md — generic EntryRow/EntrySection/EntryScreen (Phase 2)
- [x] tasks/05-generic-entry-form.md — shared EntryForm + SelectField (composition, not a generic — see AC above)
