# The ceiling card says what it means

## Outcome
- The ceiling card's horizon sentence names the months that **remain**, not the
  period's length. Read in July over a Jan–Nov range it no longer claims
  "5 meses do período" for an 11-month period.
- `sharePercent`'s contract and its parameter name describe what its callers
  actually pass.
- The unreachable `horizon` branch carries the same invariant note its two
  siblings do.
- Closes `.squad/debt.md:36`, `:37`, `:38`.

## Context

**The wrong sentence** — `src/app/_components/DashboardScreen/components/CeilingCard/hook.ts:42-47`:
```ts
    // The horizon is part of the figure, not decoration: the same balance
    // spread over twice the months is worth half as much per month, so a
    // number shown without its period is not an answer.
    horizon: tightest
      ? `Vale pelos ${months.length} meses do período. Limitado por ${formatYyyymm(tightest)}.`
      : null,
```
`months` is destructured off the `ceiling` prop (L12) and produced by `buildCeiling`
in `src/app/api/dashboard/ceiling.helper.ts:59-63`, mapping `ahead`, which is
defined at L31 as `points.filter((point) => point.month >= currentMonth)`.
`src/app/api/dashboard/types.ts:42` states it outright:
```ts
  // Current month .. range end, never empty.
```
So `months.length` is the remaining count. The wording is the only thing wrong —
the value is correct and must not change.

**Singular matters.** `months.length` is unguarded, and the repo has already ruled
on this — `.../components/GoalCard/timeline.helper.ts:14-18`:
```ts
  // Singularised, as the retired goalLabel was: "~1 MESES" is not Portuguese.
  const pace =
    months === null
      ? "RITMO ZERO"
      : `~${months} ${months === 1 ? "MÊS" : "MESES"}`;
```
A range read in its final month gives exactly 1.

**The stale contract** — `src/app/_components/DashboardScreen/list-cards.helper.ts:6-11`:
```ts
// A row's share of the largest row, for the meter fill. `max` is 0 whenever
// every row is 0 (an all-underwater range leaves no ceiling at all), and dividing
// by it would give NaN and a bar of width "NaN%".
export function sharePercent(value: number, max: number): number {
  return max > 0 ? (value / max) * 100 : 0;
}
```
Exactly two callers, and **neither passes a max-of-rows**:
- `CeilingCard/hook.ts:25` — `sharePercent(month.remaining, month.cumulative)` (that row's own total)
- `GoalCard/hook.ts:26` — `Math.floor(sharePercent(accruedCents, targetCents))`, wrapped in `Math.min(100, …)` (that goal's own target)

Both are "share of this row's own whole". The zero-divisor guard is still shared
and still correct; only the description and the parameter name are wrong.

**Imitate** the invariant-note style the repo uses for a branch that cannot run —
`.../components/LimitCard/hook.ts:16-21`:
```ts
    // Inert by construction, kept only to satisfy the type: the producer
    // emits a null percent exactly when goalCents is falsy, and that is the
    // same condition `empty` below short-circuits on, so these rows are never
    // rendered with it. Mutating the fallback changes nothing observable —
    // there is no test for it because there is no reachable behaviour.
    const percent = month.percent ?? 0;
```
and `src/app/api/dashboard/goals.helper.ts:14-19`, same template.

The `horizon` null branch qualifies on the same proof: `tightest` is null iff
`monthly === 0` (`ceiling.helper.ts:57` — `tightest: monthly > 0 ? ahead[pin].month : null`),
`empty` is `monthly === 0` (`CeilingCard/hook.ts:34`), and `CeilingCard/index.tsx`
reads `horizon` only inside the `{empty ? … : …}` else-arm at L35. So whenever
`horizon` is null, that subtree never mounts.

- **Watch out for** `CeilingCard/hook.ts` being 50 lines — a long comment can push
  it toward the cap. `wc -l` it.
- **Watch out for** `e2e/ceiling.spec.ts`, which already drives this card
  (2 tests) with fixtures `FIRST_RED_HOLE` / `DEEPEST_RED_HOLE`. Check whether it
  asserts on the horizon string before you change the wording.
- **Verify with** `npm run lint`, `npx tsc --noEmit`, `npm run test:e2e`.

## Scope
- In: `src/app/_components/DashboardScreen/components/CeilingCard/hook.ts`,
  `src/app/_components/DashboardScreen/list-cards.helper.ts`, and
  `e2e/ceiling.spec.ts` if the horizon copy is asserted there.
- Out: `src/app/api/dashboard/ceiling.helper.ts` and `types.ts` — the payload is
  correct. `GoalCard`, `LimitCard`. The `sharePercent` call sites' arguments.

## Verify
```
npm run lint
npx tsc --noEmit
npm run test:e2e
wc -l src/app/_components/DashboardScreen/components/CeilingCard/hook.ts
```
Then read the card in a browser against a range whose current month is not its
first — that is the only state where the old wording was visibly wrong, and it is
what proves the fix. Seed it the way `e2e/ceiling.helper.ts` does (its month math
is clock-relative: `CURRENT` and `shift`).

If `e2e/ceiling.spec.ts` does not already assert the horizon line, add an
assertion for the singular case — 1 remaining month is the boundary the
`GoalCard` precedent exists for.

## Forbidden
- Do not change `months.length` or anything in the dashboard API payload; the
  number is right, the sentence is not.
- Do not delete the unreachable `horizon` branch — it satisfies the type, exactly
  as its two siblings do. Comment it; do not "simplify" it.
- Do not rename `sharePercent` itself or change its behaviour — two callers depend
  on the zero-divisor guard.
- Do not add a test for the inert branch; there is no reachable behaviour to pin.
