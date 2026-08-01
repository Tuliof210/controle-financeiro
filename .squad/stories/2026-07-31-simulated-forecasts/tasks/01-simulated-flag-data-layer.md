# The `simulated` flag, end to end through the forecasts API

## Outcome
- `POST /api/forecasts` accepts an optional `simulated` boolean; omitting it
  stores `false`.
- `GET /api/forecasts` returns `simulated` on every forecast, and `PUT` can
  flip it in both directions.
- Every forecast that already existed reads back `simulated: false`.

## Context

**Imitate** `prisma/migrations/20260729184556_rename_recurrence_to_forecast/migration.sql`
for the house migration style — a prose block saying *why*, then Prisma's
`-- Section` markers:

```sql
/*
  Data-preserving rename: Recurrence -> Forecast, RecurrenceMonth -> ForecastMonth.
  Plain ALTER TABLE renames instead of Prisma's default drop+create, so existing
  rows survive. [...]
*/
-- RenameTable
ALTER TABLE "Recurrence" RENAME TO "Forecast";
```

The two migrations that rebuild a table (`20260724175058_recurrence_months`,
`20260728041618_drop_settings_range`) both do it because they **drop** a column.
Adding a defaulted column should need no rebuild — but **no migration in this
repo has ever added a column**, so read what `npx prisma migrate dev --name
add_forecast_simulated` actually writes before committing it. A rebuild here
would need the `PRAGMA defer_foreign_keys` dance the two above show, because
`ForecastMonth.forecastId` has an FK onto `Forecast.id`.

**Change** `src/core/entities/forecast.entity.ts` and
`src/core/repositories/forecast.repository.ts` — both need the field:

```ts
export type Forecast = {
  id: string; name: string; valueCents: number; type: EntryType;
  ownerId: string; months: number[]; createdAt: Date;
};
export type ForecastInput = {
  name: string; valueCents: number; type: EntryType;
  ownerId: string; months: number[];
};
```

**Watch out for** `src/infra/repositories/forecast.prisma.repository.ts`. Its
`create`/`update` spread `{ months, ...fields }` straight into Prisma's `data`,
and `list` uses `include: { months: true }` with no `select` — so persistence
and fetching need **no** change. But `toEntity` is a hand-written whitelist:

```ts
function toEntity(row: ForecastRow): Forecast {
  return { id: row.id, name: row.name, valueCents: row.valueCents,
    type: row.type as Forecast["type"], ownerId: row.ownerId,
    months: row.months.map((m) => m.month).sort((a, b) => a - b),
    createdAt: row.createdAt };
}
```

Omitting `simulated` there (and in the local `ForecastRow` type above it)
silently drops the field from every API response — and task 02's edit form
would then always reopen unchecked.

**Reuse** the single Zod shape in `src/app/api/forecasts/route.ts` — one object
feeds both verbs, so one line covers create and update:

```ts
const createSchema = z.object(forecastShape);
const updateSchema = z.object({ ...forecastShape, id: z.string().min(1) });
```

**Watch out for** `e2e/seed.helper.ts` — it POSTs forecasts at three call sites
with no `simulated` key. A bare `z.boolean()` 422s all three and reddens the
whole suite; `z.boolean().default(false)` keeps them green.

**Watch out for** `src/app/api/forecasts/route.ts` being 96 lines against the
hard 100-line cap (`npm run lint:lines`, which fails on any file this branch
touches). One added line fits; a second one may not.

**Verify with** `npm run db:setup` (= `prisma generate && prisma migrate deploy`,
applies existing folders, never authors one), then `npm run dev` and curl
against `http://localhost:3000/api/forecasts`.

## Scope
- In: `prisma/schema.prisma`, a new `prisma/migrations/<ts>_add_forecast_simulated/`,
  `src/core/entities/forecast.entity.ts`,
  `src/core/repositories/forecast.repository.ts`,
  `src/infra/repositories/forecast.prisma.repository.ts`,
  `src/app/api/forecasts/route.ts`.
- Out: any UI. No `src/app/previsoes/**`, no `src/components/**`, no dashboard.
  `src/app/api/period/service.ts` keeps reading every forecast — the Previsões
  coverage bar is meant to cover simulations too.

## Verify
```
npm run db:setup
npm run lint
npm run build
```
Then with `npm run dev` running, in another shell — the first call must echo
`"simulated":true`, the second must show every pre-existing row as
`"simulated":false`:
```
curl -s -X POST localhost:3000/api/forecasts -H 'content-type: application/json' \
  -d '{"name":"Sim","valueCents":1000,"type":"expense","ownerId":"<id de /api/people>","months":[202601],"simulated":true}'
curl -s localhost:3000/api/forecasts
```
Also POST the same body **without** the `simulated` key and confirm it comes
back `false` rather than 422 — that is the case `e2e/seed.helper.ts` depends on.

## Forbidden
- No `where` clause or new argument on `forecastRepository.list()` — task 04
  filters in memory, next to the existing `visibleFor` call.
- Do not touch `e2e/seed.helper.ts` to make the schema pass; the schema must
  accept its current bodies.
- Do not make the column nullable. `NOT NULL DEFAULT false` is what backfills
  the existing rows for free.
