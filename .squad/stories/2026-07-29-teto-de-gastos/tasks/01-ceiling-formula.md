# The ceiling is a minimum of ratios, not a minimum of balances

## Outcome
- `GET /api/dashboard` returns ONE monthly ceiling for the whole remaining
  period, plus a per-month series of what survives it — not one independent
  allowance per month.
- Subtracting that ceiling once for every month elapsed never drives any
  month's projected cumulative balance below zero.
- The goals projection still renders: its pace is never negative and its
  horizon is never zero.

## Context

The bug, `src/app/api/dashboard/slack.helper.ts:26-38`:

```ts
worstAhead = Math.min(worstAhead, point.cumulative);
if (point.month < currentMonth) continue;
const total = Math.max(0, Math.floor(MARGIN * worstAhead));
```

A suffix minimum. It prices ONE hypothetical spend in isolation, so the
emitted months are mutually exclusive. The comment above it —
*"a suffix minimum is non-decreasing as M advances, so slack never drops month
over month. That is a property of the formula, not a bug"* — documents the old
intent and must be replaced, not left standing.

- **The arithmetic.** Spending `X` extra every month starting now lowers the
  month at slice position `j` by `X * (j + 1)`. Solvency is
  `cumulative[j] - X * (j + 1) >= 0` for every `j`, so
  `X = 0.8 * min(cumulative[j] / (j + 1))`. Worked example to check against:
  cumulative `1000, 1200, 1500` → ratios `1000, 600, 500` → `X = 400`, leaving
  `600, 400, 300`.
- **`j` indexes the slice that starts at the current month, not `points`.**
  `types.ts:13` — `cumulative: number; // running sum of balance from the
  range's first month`. Past months are baked into the *value*, which is right
  (it is a stock, the money in the bank), but they must NOT contribute a
  position to the divisor. `j = 0` is the current month. The old loop walked
  every point because a suffix minimum did not care; the ratio does.
- **The tightest month is the argmin** (earliest on a tie) and the card labels
  it. Its survivor is exactly `0.2 * cumulative` — that is what `MARGIN = 0.8`
  now means. It stays 0.8.
- **Keep `Math.floor` everywhere**, per the existing comment: *"a spending
  allowance always rounds DOWN. Never `Math.trunc` — it differs on negatives,
  and the pre-clamp value can be one."* Clamp at 0 with `Math.max(0, …)`.
- **The contract to land** (shape only; naming and file layout are yours, but
  `slack`/`SlackMonth` should not survive a card called "Teto de Gastos"):

  ```ts
  type CeilingMonth = { month: number; cumulative: number; remaining: number };
  type Ceiling = {
    monthly: number; weekly: number; daily: number;  // cents, >= 0
    tightest: number | null;                          // YYYYMM that pins it
    firstRed: { month: number; shortfall: number } | null;
    months: CeilingMonth[];                           // current .. end, length >= 1
  };
  ```

  `cumulative` rides along because the card's bar is `remaining / cumulative`
  and `SlackCard` is never handed `points`. `firstRed` is the earliest month
  with `cumulative < 0`, non-null only when `monthly === 0`.
- **The invariant that makes the bar safe**: `monthly > 0` is only possible
  when every `cumulative` in the slice is positive, so the card never divides
  by zero nor paints a negative bar. Write it down where the type lives.
- **Two hazards in the goals path**, reachable only through what this task
  returns. `goals.helper.ts:58` — `Math.ceil(goal.targetCents / monthsAhead)` —
  has no guard, by explicit design (*"monthsAhead is >= 1 by construction… No
  guard."*); a `0` yields `Infinity`, which `NextResponse.json` serialises to
  `null`, breaking `neededCents: number` with no type error and no client-side
  validation. And a negative pace makes `GoalCard/hook.ts:24-27` paint a
  negative badge — `Math.min(100, Math.floor(sharePercent(…)))` has no lower
  bound. What replaces `slack.length` and `savingPace` must stay `>= 1`, `>= 0`.
- **The wiring to update**, `payload.helper.ts:36-56`:

  ```ts
  const slack = buildSlack(points, range.current);
  const pace = savingPace(slack);
  // slack runs from the current month to the range end, so its length is
  // exactly how many months are left to save in.
  goals: projectGoals(goals, { pace, monthsAhead: slack.length, current: range.current }),
  ```

  `savingPace` becomes `floor(0.25 * monthly)`. Note this incidentally fixes
  `goals.helper.ts:34`'s `accruedCents = pace * monthsAhead`, unsound against
  the old folga and sound against a real monthly rate. Confirm, do not redesign.
- **The current month is guaranteed present**, so the slice is never empty:
  `service.ts:27-28` returns `out_of_range` when
  `months.indexOf(range.current) === -1`, and `points` is 1:1 with `months`.
  `HeroCard/hook.ts:61-64` hedges against it anyway — do not copy that hedge.
- `types.ts` is 80 lines, `payload.helper.ts` 58, `slack.helper.ts` 50. Cap 100.

## Scope
- In: `src/app/api/dashboard/{slack,payload}.helper.ts` (renaming the first is
  expected), `src/app/api/dashboard/types.ts`.
- Out: every `.tsx`, plus `goals.helper.ts` and `series.helper.ts` — read, not
  edited. The card is task 02, so `tsc` ends this task reporting errors in
  `SlackCard`/`ProjectionTab`: expected, closed by the next commit, not papered
  over here.

## Verify
- `npm run lint`
- `npm run dev`, then `curl -s 'http://localhost:3000/api/people'` to pick a
  real owner name from `dev.db`, and
  `curl -s 'http://localhost:3000/api/dashboard?owner=<name>' | jq '.data'`.
- From that same response, prove the invariant instead of eyeballing it: for
  the slice of `points` from `range.current` to the end, assert
  `cumulative[j] - ceiling.monthly * (j + 1) >= 0` for every `j`, and that it
  equals `ceiling.months[j].remaining`.
- Assert the tightest month's `remaining` is within a cent above
  `0.2 * cumulative`, and `wc -l` every touched file.

## Forbidden
- Emitting a per-month `total`/`weekly`/`daily` triple. One ceiling, one set
  of splits — the mutually-exclusive list is the bug.
- Letting past months contribute a position to the divisor, or resetting
  `cumulative` to start at the current month. The value is a stock, the index
  is a count of months from now.
- A negative `pace`, or a `monthsAhead` of `0`.
- Changing `MARGIN`, `PACE_SHARE`, or anything in `series.helper.ts`.
- Adding runtime validation to the client. This payload is typed, never parsed.
