# Derive the global period from the entries

## Outcome
- Configurações has no "Período da projeção" card; nothing in the UI edits a
  period any more.
- A single derived-period function answers oldest→newest across every
  `RecurrenceMonth.month` and `Movement.month`, or nothing when both are empty.
  Two callers need it (the dashboard service and the screens), so it promotes
  to `src/core/use-cases/` and gets its own route.
- A recurrence interval is a start/end pair of month+year pickers, add/remove
  interval intact; a movement's month is one such picker. Years 2000–2099.
- Both forms save any month in that domain on an empty database — no period
  guard, no clamping, no "must be inside the range" submit check.
- The dashboard's two period notices name the entries, not Configurações.

## Independently shippable
yes

## Scope
- In: `src/lib/months.ts`, `src/core/use-cases/`, a new `src/app/api/period/`,
  `src/app/api/dashboard/service.ts`, `src/app/api/settings/`,
  `src/core/entities/settings.entity.ts`,
  `src/infra/repositories/settings.prisma.repository.ts`,
  `src/components/EntryScreen/`, both entry forms, `SettingsScreen`,
  `src/app/_components/DashboardScreen/index.tsx`, and the `month` bound in
  `src/app/api/{movements,recurrences}/route.ts`.
- Out: `prisma/schema.prisma` and any migration — the two columns stay in the
  DB, unread, until 03. The chart components — 02 owns those. `CoverageBar` and
  `coverage.helper.ts` — they consume a period and need no change.
- Imitate: `src/components/MonthPicker/` already IS the month+year select pair
  these forms need; `src/app/api/goals/` for the route + service pair shape.
- Reuse: `MonthPicker`, `buildMonths`, `intervalsToMonths`/`monthsToIntervals`,
  and the lists the dashboard service already fetches — no new repository
  method is needed to find the min and the max.

## When to run
- Depends on: none
- Parallel-safe with: 02

## Verify
- `npm run lint`, `npm run test`, `npm run build`
- `npx vitest run src/lib/months.test.ts` — `yearOptions` is asserted there and
  its contract is what changes.
- Copy the SQLite file aside, empty both tables, and register one movement and
  one recurrence through the UI: both must save with no period defined anywhere,
  and the dashboard must then cover exactly those months.
- Prove `MonthPicker`'s mount-time self-seed cannot fire in either form — every
  consumer has to hand it a non-null value from the first render.

## Forbidden
- Never clamp, filter or reject an entry month for sitting outside the period:
  the period is the output of the months, never an input to them.
- `MonthRangeSlider`, `RangeSection` and `RangeTimeline` are deleted, not
  disabled or left unrendered.
- `rangeStart`/`rangeEnd` leave the `Settings` entity, its Zod schema and its
  repository mapping in this task.
- Do not leave `month` accepting `999912` at the route boundary — the derived
  period feeds `buildMonths`, so one corrupt row would enumerate ~950k months.
