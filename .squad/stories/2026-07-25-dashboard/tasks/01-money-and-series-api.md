# Money display helpers + `GET /api/dashboard` core series

## Description

Two things, both foundational for every other task in the story.

**1. A money formatter fit for display.** The only money formatter in the
codebase is `formatCents` in `src/components/MoneyInput/money.helper.ts`, and
it is built for the *input* field: it applies `Math.abs` (so a negative
balance renders as positive) and emits no thousands separator
(`formatCents(123456) === "1234,56"`). The dashboard shows large numbers and
a cumulative balance that legitimately goes negative, so it needs a signed,
grouped display formatter. Its own file already invites the change:
`// ponytail: no thousands grouping; add a "." grouper in formatCents when
large goals need it.`

Rather than importing a component-folder helper from `src/lib/`, **move** the
module to `src/lib/money.ts` — it is a pure, framework-agnostic helper, which
is exactly what `src/lib/` is for per `.squad/ARCHITECTURE.md`. `formatCents`
and `digitsToCents` keep their current behaviour byte for byte: `MoneyInput`
reformats its value on every keystroke and has three carefully tuned caret
handlers, so changing what `formatCents` returns would break the field.

**2. `GET /api/dashboard?owner=<personId|familia>`** — the endpoint that does
all the aggregation server-side. This task ships the core: the per-month
effective series, the cumulative balance, the dashed-line breakpoint, and the
three statistic blocks (Entradas/Saídas/Saldo). Task 02 appends four more
blocks to the same payload.

The reconciliation rule, per month **and per type**:

```
income(M)  = max( Σ real income(M),  Σ estimated income(M) )
expense(M) = max( Σ real expense(M), Σ estimated expense(M) )
balance(M) = income(M) − expense(M)                       // may be negative
```

`Recurrence.valueCents` is **per active month** — a recurrence of 500000
active Jan–Dec contributes 500000 to *each* of those twelve months, never
500000 / 12. Nothing in the codebase currently multiplies or divides it;
confirm you do not either.

`incomeEstimated` / `expenseEstimated` flag the months where the estimate
strictly beat the actuals — those are projections, and tasks 05/06 use the
flags for the 50%-opacity bars and the solid→dashed line break.

## When to run

- Depends on: none
- Parallel-safe with: task 03 (`Tooltip`) — disjoint files

## How-to

### Files

```
src/lib/money.ts                              # moved from components/MoneyInput/money.helper.ts + new formatters
src/lib/money.test.ts                          # moved from money.helper.test.ts + new cases
src/app/api/dashboard/route.ts                 # thin controller
src/app/api/dashboard/service.ts               # use case: 4 repo reads -> payload
src/app/api/dashboard/service.test.ts
src/app/api/dashboard/types.ts                 # the contract, imported by service + (later) the screen
src/app/api/dashboard/series.helper.ts         # pure: months x entries -> MonthPoint[]
src/app/api/dashboard/series.helper.test.ts
src/app/api/dashboard/stats.helper.ts          # pure: number[] -> Stats
src/app/api/dashboard/stats.helper.test.ts
```

Deleted: `src/components/MoneyInput/money.helper.ts`,
`src/components/MoneyInput/money.helper.test.ts`.

### Step 1 — move the money helper

`git mv src/components/MoneyInput/money.helper.ts src/lib/money.ts` and the
same for the test (rename the import inside it to `./money`). Then update the
**four** importers — this is the complete list, verified by grep:

- `src/components/MoneyInput/hook.ts:8` — `from "./money.helper"` → `from "@/lib/money"`
- `src/components/EntryRow/index.tsx:4`
- `src/app/configuracoes/.../GoalsSection/index.tsx:8`
- `src/app/configuracoes/.../MonthlyGoalSection/index.tsx:7`

Do not touch the bodies of `formatCents` / `digitsToCents` / `MAX_CENTS`, and
keep the existing `ponytail:` comment (reword it to point at `formatMoney` as
the grouper that now exists).

### Step 2 — add the display formatters to `src/lib/money.ts`

```ts
// "R$ 1.234,56" / "−R$ 640,00". U+2212 minus, matching the DS money pattern
// in src/styles/docs/Colors.mdx. formatCents stays sign-less and ungrouped
// because MoneyInput reformats on every keystroke and its caret handlers
// depend on that exact output.
export function formatMoney(cents: number): string
// "R$ 1.234" — cents dropped (truncated toward zero), for chart axis labels.
export function formatMoneyShort(cents: number): string
```

Grouping is `.` (pt-BR), decimal separator is `,`. Reuse `formatCents` for the
`,00` half instead of reimplementing it. Cases to cover in
`src/lib/money.test.ts` beyond the four moved ones: zero, a value under R$
1.000 (no separator), a value over R$ 1.000.000 (two separators), a negative
value (leading `−`, digits unaffected), and `formatMoneyShort` dropping cents
without rounding up.

### Step 3 — the contract, `src/app/api/dashboard/types.ts`

The whole payload, including the four blocks task 02 adds — declare it once
here so task 02 only fills fields in, and mark the task-02 fields with a short
comment. A discriminated `status` covers the three screen states.

```ts
export type MonthPoint = {
  month: number;            // YYYYMM
  income: number;           // max(real, estimated) — cents
  expense: number;
  balance: number;          // income - expense, may be negative
  cumulative: number;       // running sum of balance from the range's first month
  incomeEstimated: boolean; // estimated > real  -> projection, render at 50% opacity
  expenseEstimated: boolean;
};

export type Stats = {
  total: number;   // sum over the whole range
  current: number; // sum over rangeStart .. currentMonth inclusive
  mean: number;
  stdDev: number;
  median: number;
};

export type DashboardData =
  | { status: "no_range" }
  | { status: "out_of_range"; range: { start: number; end: number; current: number } }
  | {
      status: "ok";
      range: { start: number; end: number; current: number };
      points: MonthPoint[];
      dashedFrom: number | null; // first month with incomeEstimated || expenseEstimated
      income: Stats;
      expense: Stats;
      balance: Stats;
      // --- filled by task 02 ---
      slack: SlackMonth[];
      pace: number;
      limit: { goalCents: number | null; months: LimitMonth[] };
      coverage: { committed: number; recorded: number; percent: number | null; months: CoverageMonth[] };
      goals: GoalProjection[];
    };
```

In this task, ship the task-02 fields as empty (`slack: []`, `pace: 0`,
`limit: { goalCents: null, months: [] }`,
`coverage: { committed: 0, recorded: 0, percent: null, months: [] }`,
`goals: []`) so the type is honest and task 02 is a pure fill-in. Declare
`SlackMonth`, `LimitMonth`, `CoverageMonth` and `GoalProjection` here too —
task 02's task file has their exact shapes; copy them verbatim from there.

### Step 4 — `series.helper.ts` (pure, the heart of the story)

```ts
buildSeries(months: number[], movements: Movement[], recurrences: Recurrence[]): MonthPoint[]
```

Both inputs are already filtered by owner when this is called. Build a
per-month accumulator over the four sums (real income, real expense,
estimated income, estimated expense), then derive each `MonthPoint`. A
`Movement` contributes to `movement.month`; a `Recurrence` contributes
`valueCents` to **each** month in `recurrence.months`. Entries whose month is
not in `months` are dropped — rows outside the global range exist and are
deliberately excluded (see the story).

Also export:

```ts
firstEstimatedMonth(points: MonthPoint[]): number | null  // -> dashedFrom
sumUpTo(points: MonthPoint[], month: number, pick: (p: MonthPoint) => number): number
```

Tests must cover: a recurrence spanning several months counted once per month
(not divided); real winning in one month and estimated winning in the next;
a tie (`real === estimated` → **not** flagged as estimated, the rule is
strictly greater); a month with no data at all (all zeros, not absent from the
series); a negative monthly balance carried correctly into `cumulative`; and
`firstEstimatedMonth` returning `null` when every month is real-dominant.

Watch the 100-line file cap — if the accumulator plus the derivations run
long, split the accumulator into its own `*.helper.ts`.

### Step 5 — `stats.helper.ts` (pure)

```ts
computeStats(values: number[], currentIndex: number): Stats
```

`values` is the per-month effective series across the whole range;
`currentIndex` is the index of the current month within it.

- `total` = sum of all values; `current` = sum of `values[0..currentIndex]` inclusive.
- `mean` = `Math.round(total / values.length)`.
- `stdDev` = **population** standard deviation (divide by `N`, not `N−1`), `Math.round`ed.
- `median` = sorted middle; for an even count, `Math.round` of the mean of the two middle values.
- Empty input returns all zeros — do not divide by zero.

Everything is integer cents. `Math.round` is the convention for derived
statistics here; `Math.trunc` in `formatCents` is a formatting concern, not a
rounding policy. Tests: odd and even counts, a single value, an empty array, a
series containing negatives, and `currentIndex` at the first and last position.

### Step 6 — `service.ts`

```ts
export async function getDashboard(owner: string): Promise<DashboardData>
```

1. Read all four repositories in parallel (`Promise.all`) —
   `settingsRepository.get()`, `movementRepository.list()`,
   `recurrenceRepository.list()`, `goalRepository.list()`. `goals` is unused
   until task 02; fetch it anyway so task 02 touches nothing here, or leave it
   out and let task 02 add it — your call, just be consistent.
2. `settingsRepository.get()` is an upsert and never returns null, but
   `rangeStart` / `rangeEnd` are `number | null` and **can be persisted
   inverted or half-null** through the API (`PUT /api/settings` `.refine()`
   only validates the incoming patch, never the merged result). Return
   `{ status: "no_range" }` when either bound is null **or** when
   `buildMonths(start, end)` comes back empty.
3. `currentYYYYMM()` from `@/lib/months`. If it is outside `[start, end]`,
   return `{ status: "out_of_range", range }`.
4. Filter both lists with `visibleFor(list, owner)` from `@/lib/ownership` —
   it already handles the `FAMILY_PROFILE` (`"familia"`) sentinel and is a
   pure, framework-agnostic helper, so importing it server-side is fine.
5. `buildMonths(start, end)` → `buildSeries(...)` → `computeStats(...)` ×3
   (income, expense, balance) → assemble.

`service.ts` must not import `NextRequest`/`NextResponse`. Keep it under 100
lines — if assembling the payload pushes it over, extract the assembly into a
`payload.helper.ts`.

`service.test.ts`: follow the exact idiom of
`src/app/api/recurrences/service.test.ts` — `vi.mock("@/infra/repositories/…",
() => ({ xRepository: { list: vi.fn() } }))` written **above** the imports,
then `vi.mocked(x.list).mockResolvedValue(...)`. There is no `beforeEach` /
`vi.clearAllMocks()` anywhere in this repo; four separate `vi.mock` calls are
needed here, so add `beforeEach(() => vi.clearAllMocks())` in this file and
say so in the PR — it is a justified departure, not drift. Cover: null range →
`no_range`; inverted range → `no_range`; current month past `rangeEnd` →
`out_of_range`; happy path with a person `owner` excluding another person's
entries; `owner: "familia"` including both.

Pin the clock: `computeStats`' `currentIndex` derives from `currentYYYYMM()`,
which reads the real date. This repo has **no** `vi.useFakeTimers` anywhere —
existing tests inject a `Date` instead (`currentYYYYMM(new Date(2026, 6, 22))`
in `src/lib/months.test.ts`). Do the same: give `getDashboard` an optional
second parameter `now = new Date()` and pass a fixed date from the tests.

### Step 7 — `route.ts`

`GET` needs a `NextRequest` — **no existing GET in this codebase takes one**,
so mirror the `DELETE` handlers instead
(`src/app/api/movements/route.ts:73-76`):

```ts
export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  if (!owner) return fail("Dados inválidos", "validation", 422);
  try {
    return ok(await getDashboard(owner));
  } catch {
    return fail("Erro ao carregar dashboard", "internal", 500);
  }
}
```

`ok` / `fail` from `@/lib/http`. No Zod schema is warranted for a single
free-form string param, but state that reasoning in the PR. Per
`.squad/learnings.md`, `route.ts` has zero automated coverage in this repo —
so smoke-test by hand and record the results in the PR: `?owner=familia`,
`?owner=<real id>`, `?owner=` (blank → 422), and no `?owner` at all (→ 422).

### Verification

```bash
npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

Run `npm install` and `npm run db:setup` first in a fresh worktree — neither
`node_modules` nor the gitignored SQLite file is shared across worktrees, and
Node's parent-directory walk-up covers the former but not the latter.

Baselines, measured on `main` at `09fb645` — anything beyond these is yours:

- `npm run lint` → **exit 1**, exactly 2 errors, both in
  `.design-sync/gen-cards.mjs` (1 `assist/source/organizeImports`, 1
  formatter), plus 1 deprecation info for `biome.json:17`. Zero errors in `src/`.
- `npm run test` → **exit 0**, 16 files / 95 tests.
- `npx tsc --noEmit` → **exit 2**, exactly 1 error:
  `theme.helper.test.ts(21,22): error TS2345`.
- `npm run build` → **exit 0** (Next only typechecks bundled files, which is
  why it is green while `tsc --noEmit` is not).

Constraints Biome will enforce (`biome.json`, no `overrides`): 100 lines per
file, 100 lines per function, 2-space indent, double quotes, **line width 80**
(unset → Biome's default), and `organizeImports` as an error.

Smoke-test the endpoint live: start the dev server from inside the worktree on
a spare port (`preview_start`'s `{name}` launcher always runs from the main
checkout, not a worktree), then hit it with `curl`.
