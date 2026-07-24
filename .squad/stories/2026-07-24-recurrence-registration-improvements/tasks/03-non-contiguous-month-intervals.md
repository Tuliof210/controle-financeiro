# Non-contiguous month intervals (RecurrenceMonth child table + multi sliders)

## Description
Replace a recurrence's single contiguous period (two `Int` YYYYMM columns
`rangeStart`/`rangeEnd` + one two-thumb slider) with a **set of active months**
so the user can pick a single month or non-contiguous periods (e.g. Jan–Mar +
Jul–Dez, skipping Apr–Jun).

Design (decided with the owner):
- **Storage:** a new child table `RecurrenceMonth` — one row per active month
  (`recurrenceId` FK + `month` YYYYMM `Int`). Chosen over a serialized column so
  future projections can query "which recurrences are active in month X" in SQL.
- **Canonical shape:** entity / repository / API all speak `months: number[]`
  (sorted, de-duped YYYYMM list). This is the storage-aligned form.
- **UI:** keep the existing `MonthRangeSlider` (two native `<input type=range>`
  thumbs) but render **several** — one per contiguous interval — with add /
  remove. The form converts intervals ↔ months at its boundary; nothing outside
  the form deals in intervals. Two adjacent intervals collapsing into one on
  reload is fine (they're semantically identical); only non-adjacent intervals
  stay separate.

This is a full-stack shape change kept as **one task** on purpose: splitting
backend and UI would leave the app in a broken intermediate state (form sending
`rangeStart/rangeEnd` while the API expects `months`). No dashboard/projection
reads recurrences yet, so nothing downstream breaks. `dev.db` holds the owner's
3 real recurrences — the migration **backfills** them, does not reset.

## When to run
- Depends on: none
- Parallel-safe with: 01. **NOT parallel-safe with 02** — both edit
  `RecurrenceForm/index.tsx` and `RecurrenceRow/*`. Land 02 first (smaller);
  then this task.

## How-to

### A. Prisma schema + migration (with data backfill)
`prisma/schema.prisma` — the `Recurrence` model is at `:30-40`. Client is
generated to `src/generated/prisma` (`:6-9`), datasource sqlite (`:11-13`).

1. Remove `rangeStart Int` / `rangeEnd Int` from `Recurrence`; add the relation:
   ```prisma
   model Recurrence {
     id         String            @id @default(cuid())
     name       String
     valueCents Int
     type       String
     owner      Person            @relation(fields: [ownerId], references: [id])
     ownerId    String
     months     RecurrenceMonth[]
     createdAt  DateTime          @default(now())
   }

   model RecurrenceMonth {
     id           String     @id @default(cuid())
     recurrence   Recurrence @relation(fields: [recurrenceId], references: [id], onDelete: Cascade)
     recurrenceId String
     month        Int        // YYYYMM
     @@unique([recurrenceId, month])
     @@index([month])
   }
   ```
   `onDelete: Cascade` is **required** — without it Prisma defaults to
   `RESTRICT`, and the existing `DELETE /api/recurrences?id=` endpoint would
   start throwing `P2003` (a known trap in this repo: a new relation FK broke a
   sibling delete before). With Cascade, deleting a recurrence removes its
   month rows automatically. (The `Recurrence.owner → Person` FK is unchanged;
   `DELETE /api/people` already maps `P2003` → "Pessoa não encontrada".)

2. Generate the migration **without applying**, then hand-edit it to backfill:
   ```
   npx prisma migrate dev --name recurrence_months --create-only
   ```
   Migration naming convention (matches
   `prisma/migrations/20260723031911_add_recurrences/`):
   `<UTC YYYYMMDDHHMMSS>_recurrence_months/migration.sql`.

3. Prisma's SQLite column-drop rebuilds `Recurrence` (create `Recurrence_new`,
   copy rows, drop old, rename). **Insert this backfill INSERT before that
   rebuild block, right after `CREATE TABLE "RecurrenceMonth"`** — it must read
   `rangeStart`/`rangeEnd` while they still exist. YYYYMM is monotonic as an
   integer across year boundaries, so a recursive CTE stepping month-by-month
   works:
   ```sql
   INSERT INTO "RecurrenceMonth" ("id", "recurrenceId", "month")
   WITH RECURSIVE expand(recId, m, endM) AS (
     SELECT "id", "rangeStart", "rangeEnd" FROM "Recurrence"
     UNION ALL
     SELECT recId,
            CASE WHEN m % 100 = 12 THEN (m / 100 + 1) * 100 + 1 ELSE m + 1 END,
            endM
     FROM expand WHERE m < endM
   )
   SELECT lower(hex(randomblob(16))), recId, m FROM expand;
   ```
   (`lower(hex(randomblob(16)))` supplies a String id for the raw insert since
   `@default(cuid())` only fires for Prisma-issued inserts.) Verify the copy in
   `Recurrence_new` does **not** carry `rangeStart`/`rangeEnd` forward.

4. Apply: `npm run db:setup` (`prisma migrate deploy`). Then in a `sqlite3`
   check, confirm the 3 existing rows produced the expected month spans (Salário
   202601–202812 → 24 rows; PLR 202601–202601 → 1 row).

### B. Domain + repository
- `src/core/entities/recurrence.entity.ts:1-10` — replace `rangeStart`/`rangeEnd`
  with `months: number[]`.
- `src/core/repositories/recurrence.repository.ts:3-10` — same swap in
  `RecurrenceInput`.
- `src/infra/repositories/recurrence.prisma.repository.ts` (current create/update
  spread input straight into Prisma at `:14-22`):
  - `create`: `prisma.recurrence.create({ data: { name, valueCents, type, ownerId,
    months: { create: input.months.map((month) => ({ month })) } },
    include: { months: true } })`.
  - `update`: replace the whole month set in one call —
    `data: { …fields, months: { deleteMany: {}, create: input.months.map((month) => ({ month })) } }`,
    with `include: { months: true }`.
  - `list`/`get`: add `include: { months: true }`.
  - Add a small `toEntity(row)` mapper: `{ id, name, valueCents, type, ownerId,
    createdAt, months: row.months.map((r) => r.month).sort((a, b) => a - b) }`.
    The `type` field is a literal union in the entity but plain `string` from
    Prisma (project has no Prisma enums) — cast the mapped result
    `as Recurrence` with a `ponytail:` comment noting Zod guards `type` at the
    write boundary (same pattern already used elsewhere for literal-union rows).
  - Watch the 100-line file cap — extract the mapper to a
    `recurrence.mapper.ts` helper if the repository file would exceed it.

### C. API (Zod) — `src/app/api/recurrences/route.ts`
- `recurrenceShape` (`:13-20`): drop `rangeStart`/`rangeEnd`; add
  `months: z.array(z.number().int().min(190001).max(999912)).min(1)`.
  Optionally `.transform((a) => [...new Set(a)].sort((x, y) => x - y))` to
  dedupe+sort defensively.
- Remove the `validRange` refine (`:22-26`, the `rangeStart <= rangeEnd` check);
  `createSchema` becomes `z.object(recurrenceShape)`. `updateSchema` still adds
  `id`. Service (`service.ts`) is a thin passthrough — no change beyond types.

### D. Form UI — `RecurrenceForm/` and children
- **Conversion helper** — add `intervals.helper.ts` (+ colocated
  `intervals.helper.test.ts`) in the RecurrenceForm folder:
  - `intervalsToMonths(intervals: {start:number; end:number}[]): number[]` —
    expand each interval (reuse `buildMonths` from
    `components/MonthRangeSlider/months.helper.ts`), dedupe, sort.
  - `monthsToIntervals(months: number[]): {start:number; end:number}[]` — sort,
    then group consecutive YYYYMM runs (consecutive = next-month step; reuse
    `composeYYYYMM`/`splitYYYYMM` from `src/components/MonthPicker/month.helper.ts`)
    into `{start, end}` intervals.
  This is the one piece of non-trivial logic in the task — the test is required
  (single month, two adjacent intervals collapsing, non-adjacent staying split,
  empty).
- **`RecurrenceForm/hook.ts`** (`:7-96`, currently ~96 lines — near the cap, so
  extract aggressively):
  - `RecurrenceFormValues` (`:7-14`): replace `rangeStart`/`rangeEnd` with
    `months: number[]`.
  - State: `intervals: {start;end}[]` seeded from `initial.months` via
    `monthsToIntervals`, else `[{ start: period.start, end: period.end }]`.
  - Handlers: `updateInterval(i, {start,end})`, `addInterval()` (pushes another
    `{start: period.start, end: period.end}`), `removeInterval(i)` (guard: keep
    ≥1). Replace the old single `onRangeChange` (`:51-54`).
  - `canSubmit` (`:56-61`): `period !== null && name.trim() && valueCents >= 1 &&
    ownerId !== "" && intervals.length >= 1 && intervalsToMonths(intervals).length >= 1`.
    (The slider still pins each thumb so `start <= end` per interval.)
  - `handleSubmit` (`:63-77`): emit `months: intervalsToMonths(intervals)`
    instead of `rangeStart`/`rangeEnd`.
- **New child component `IntervalList/`** (3-file: index.tsx/hook.ts/style.module.scss)
  under `RecurrenceForm/components/` — renders one `MonthRangeSlider` per
  interval, each with a remove (×) button (hidden/disabled when only one), plus
  an "+ Adicionar intervalo" button. This keeps `RecurrenceForm/index.tsx` and
  `hook.ts` under the 100-line cap. `MonthRangeSlider` itself needs **no change**
  — it already takes `months` (axis), `rangeStart`, `rangeEnd`, `onChange`;
  instantiate it N times, each bound to `intervals[i]`.
- **`RecurrenceForm/index.tsx`** — swap the single `<MonthRangeSlider>` for
  `<IntervalList>`; the Entrada/Saída toggle block (`:47-57`) is untouched here
  except by task 02.

### E. List display — `recurrence-range.helper.ts` + `RecurrenceRow`
- `src/app/recorrencias/_components/RecurrencesScreen/recurrence-range.helper.ts`
  (`:6-14`): `formatYyyymm` stays; replace/extend `formatPeriod` with
  `formatMonths(months: number[]): string` that groups via `monthsToIntervals`
  and joins interval labels, e.g. `"Jan–Mar/26 · Jul–Dez/26"` (single-month
  interval renders as just `"Mai/26"`). Reuse `monthsToIntervals` from D.
- `RecurrenceRow/index.tsx:33-35` — call `formatMonths(recurrence.months)`.

### F. Tests to update (fixtures currently hard-code rangeStart/rangeEnd)
- `src/app/api/recurrences/service.test.ts:23-30` — swap fixture to `months`.
- `src/app/recorrencias/_components/RecurrencesScreen/recurrences.helper.test.ts:8-17`
  — `make()` fixture → `months`.
- `src/app/.../recurrence-range.helper.test.ts` — rewrite for `formatMonths`.
- `src/app/.../MonthRangeSlider/months.helper.test.ts` — keep (`buildMonths`
  reused).
- Add `intervals.helper.test.ts` (see D).

## Gotchas / invariants
- **Fresh worktree:** run `npm run db:setup` before hitting the API or building
  — the SQLite file is gitignored and not shared across worktrees, and
  node_modules parent-walk-up does not cover the DB file.
- Recurrence months are expected to stay within the global Settings period
  (`period` fed into the form from Settings — `RecurrencesScreen/hook.ts:78-81`).
  The sliders' axis is `buildMonths(period.start, period.end)`, so selection is
  naturally clamped to that window; no extra validation needed. If `period`
  is null the form already disables submit — keep that.
- Manual smoke tests (route.ts logic has no automated coverage in this repo):
  malformed/empty JSON body, and delete-a-recurrence (confirm cascade removes
  its `RecurrenceMonth` rows), in addition to the happy path.

## Verification (repo root)
```
npm install
npm run db:setup
npm run lint
npm run test
npm run build
```
Then manual: `npm run dev` → add a recurrence with Jan–Mar + Jul–Dez (two
sliders), save, reload, edit → the two intervals come back; the list shows both;
a single-month recurrence saves and displays as one month.
