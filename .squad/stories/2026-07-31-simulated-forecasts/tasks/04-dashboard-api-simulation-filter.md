# `/api/dashboard` learns to exclude simulated forecasts

## Outcome
- `GET /api/dashboard?owner=…&cap=…&simulation=real` computes every figure as
  if simulated forecasts did not exist — including the derived period.
- `simulation=all` returns exactly today's payload.
- An absent or unrecognised `simulation` value behaves as `real`, with a 200.

## Context

**The contract this task establishes**, mirroring `src/lib/ceiling-caps.ts`:

```ts
// src/lib/simulation.ts
export const SIMULATION_VIEWS = ["real", "all"] as const;
export type SimulationView = (typeof SIMULATION_VIEWS)[number];
export const DEFAULT_SIMULATION_VIEW: SimulationView = "real";
```

The response shape is unchanged — no new field on `DashboardData`.

**Imitate `cap` — it is the same kind of param.** `src/app/api/dashboard/route.ts`
(35 lines, room to spare):

```ts
const capSchema = z.enum(CEILING_CAPS).catch(DEFAULT_CEILING_CAP).transform(Number);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const owner = params.get("owner");
  if (!owner) return fail("Dados inválidos", "validation", 422);
  try {
    return ok(await getDashboard(owner, capSchema.parse(params.get("cap"))));
  } catch { return fail("Erro ao carregar dashboard", "internal", 500); }
}
```

The file's own comment explains the `.catch` over `safeParse` + 422: the value
is set by our own selector, and `src/lib/api.ts` renders any error envelope as
the screen's red notice, so a bad value would look like an outage. Follow it —
never 422 on `simulation`.

**Filter in one place, and filter early.** `src/app/api/dashboard/service.ts`
(42 lines) is the *only* dashboard read of forecasts:

```ts
  const [movements, forecasts, goals] = await Promise.all([...]);
  const period = derivePeriod(movements, forecasts);
  if (period === null) return { status: "no_range" };
  const months = buildMonths(period.start, period.end);
  const range = { ...period, current: currentYYYYMM(new Date()) };
  const currentIndex = months.indexOf(range.current);
  if (currentIndex === -1) return { status: "out_of_range", range };
  return buildPayload({ range, months, currentIndex, goals,
    movements: visibleFor(movements, owner),
    forecasts: visibleFor(forecasts, owner), cap });
```

Everything downstream is a pure function of `buildSeries(months, movements,
forecasts)` — KPIs, both charts, `buildCeiling`, `savingPace`, `projectGoals`,
and `HeroBand`'s own re-aggregation all read `points`. One `.filter` therefore
covers the whole board.

Apply it to `forecasts` **before** the `derivePeriod` line, not beside
`visibleFor`: `derivePeriod` runs on the unfiltered, un-owner-scoped list, and
"as if they did not exist" has to include the range. Consequence to accept
knowingly: if a simulated forecast is the only entry reaching the current month,
`real` can legitimately answer `no_range` or `out_of_range` — the screen already
renders a Notice for each.

**Do not reorder anything else.** `buildCeiling` reads its `ahead` array as
non-empty, and that is guaranteed only by the `out_of_range` guard above it.

**Watch out for `src/app/api/period/route.ts`** — it calls the same
`derivePeriod` over every forecast and must stay that way. Its only consumer is
`EntryScreen`, which draws the Previsões coverage bar, and that screen is meant
to cover simulations too.

**Verify with** `curl`; the dashboard has no `service`-level test to run.

## Scope
- In: `src/lib/simulation.ts` (new), `src/app/api/dashboard/route.ts`,
  `src/app/api/dashboard/service.ts`.
- Out: `payload.helper.ts`, `series.helper.ts`, `ceiling.helper.ts`,
  `pace.helper.ts`, `goals.helper.ts`, `stats.helper.ts` — none of them should
  learn what a simulation is. Out: `src/app/api/period/**`, all of
  `src/app/_components/DashboardScreen/**` (task 05), all of `src/infra/**`.

## Verify
```
npm run lint
npm run build
```
With `npm run dev` running and at least one simulated forecast in `dev.db`
(create one via `/previsoes` after task 02, or POST it directly), compare the
two payloads — the second must show a smaller `income.total` or `expense.total`
on whichever side the simulation sits, and its `range` must not depend on the
simulated forecast's months:
```
curl -s 'localhost:3000/api/dashboard?owner=familia&cap=50&simulation=all'
curl -s 'localhost:3000/api/dashboard?owner=familia&cap=50&simulation=real'
```
Then confirm `&simulation=lixo` and a missing `simulation` both return a normal
200 identical to `simulation=real` — not a 422.

## Forbidden
- No `where` clause and no new argument on `forecastRepository.list()`; the
  filter is in memory, in `service.ts`.
- No new field on `DashboardData` — the client already knows what it asked for.
- Do not filter movements or goals. A movement is something that happened; a
  goal has no owner and no simulation.
