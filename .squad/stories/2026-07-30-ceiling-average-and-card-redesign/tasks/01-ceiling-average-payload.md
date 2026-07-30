# The ceiling payload carries the average of every month's budget

## Outcome
- `GET /api/dashboard` returns, inside `ceiling`, the raw arithmetic mean of
  every month's own budget, plus that mean's weekly and daily splits.
- The mean's denominator is `ceiling.months.length` — every remaining month of
  the range, zeros included, not just the ones the card renders.
- `pace` (the savings-capacity figure on the goals banner) is byte-identical to
  before.

## Context
**Imitate** `src/app/api/dashboard/ceiling.helper.ts` (81 lines) — the tail of
`buildCeiling` is where this lands, verbatim:

```ts
  const monthly = months[0].budget;

  return {
    monthly,
    weekly: Math.floor(monthly / 4),
    daily: Math.floor(monthly / 30),
    tightest: monthly > 0 ? tightestMonth(ahead, worst[0]) : null,
    firstRed: red ? { month: red.month, shortfall: -red.cumulative } : null,
    months,
  };
```

`months` is built just above it, one entry per month from the current month to
the range end (`const ahead = points.filter((point) => point.month >= currentMonth)`),
each `{ month, budget, worstAhead, remaining }`. `budget` is the month's own
extra-spending figure, already net of everything the earlier months authorised.

**Reuse** the summing pattern already in `src/app/api/dashboard/pace.helper.ts`
(28 lines), verbatim:

```ts
export function savingPace(ceiling: Ceiling): number {
  const total = ceiling.months.reduce((sum, month) => sum + month.budget, 0);
  return Math.floor(total / (PACE_DIVISOR * ceiling.months.length));
}
```

**Contract** — the new field on `Ceiling` in `src/app/api/dashboard/types.ts`
(94 lines, cap is 100 — compress a comment if it does not fit; do NOT move the
arithmetic to the client to save lines):

```ts
average: { monthly: number; weekly: number; daily: number };
```

with `average.monthly = floor(Σ budget / months.length)`, and `weekly`/`daily`
floored from it by 4 and by 30 exactly as `monthly` already is.

**Watch out for:**
- The house rounding rule stated in `ceiling.helper.ts`'s own header comment:
  floor everywhere, divide last, never `Math.trunc`. `floor(average/4)` and
  `floor(sum/(4n))` are NOT the same number — which is why `savingPace` must
  keep computing its own quotient from `months` and must not be rewritten to
  derive from `average`. `e2e/goals.spec.ts` pins `pace` to
  `Math.floor(total / (4 * budgets.length))` and will redden if you touch it.
- `months` is never empty (`service.ts` returns `out_of_range` before
  `buildCeiling` is reached), so the division needs no guard.
- There is no Zod schema and no duplicated client type on this response — the
  card imports `Ceiling` from the same file, so the field crosses the boundary
  by adding it once.
- A red month ahead zeroes every `budget`, so `average.monthly` is 0 exactly
  when the card is in its empty state. Do not special-case it here.

**Verify with** `npm run lint`, `npm run build`, `npm run test:e2e`.

## Scope
- In: `src/app/api/dashboard/ceiling.helper.ts`,
  `src/app/api/dashboard/types.ts`.
- Out: `pace.helper.ts`, `payload.helper.ts`, `service.ts`, `route.ts` — none
  need a change if the field is built inside `buildCeiling`. No UI file, no
  e2e file: nothing renders this yet.

## Verify
```
npm run lint
npm run build
npm run test:e2e
```
Then confirm the field is actually on the wire, with the dev server running:
```
curl -s 'http://localhost:3000/api/dashboard' | head -c 400
```

## Forbidden
- Changing `savingPace`, `PACE_DIVISOR`, or the value of `pace`.
- Renaming or reshaping `monthly`, `weekly`, `daily`, `tightest`, `firstRed`,
  `months`, or any `CeilingMonth` field — the card and four e2e helpers read
  them by name.
- Rounding with `Math.round` or `Math.trunc`, or dividing before summing.
