# Savings capacity = 25% of the average monthly ceiling

## Outcome
- The "CAPACIDADE DE POUPANÇA" figure equals 25% of the arithmetic mean of
  every `budget` in `ceiling.months` — the current month to the end of the
  global period, zeros included.
- `sustainable.helper.ts` and the `sustainable` field of `Ceiling` no longer
  exist.
- The banner's two side facts read "OBJETIVOS" (the count) and "TOTAL EM
  METAS" (the sum of targets). "COBERTAS NO PERÍODO" is gone.

## Context
Owner's decision (2026-07-30): the pace is now derived from the very figures
the Teto de Gastos card displays — their mean — not from a separate flat rate.

- **The formula**, as a contract:
  `pace = Math.floor(sum(ceiling.months[].budget) / (4 * ceiling.months.length))`
  Divide last, exactly as the house rule in `ceiling.helper.ts:31-34` demands:
  > "`(4 * gap) / 5` floored, in that order, never leaves the integers. Writing
  > it as `0.8 * gap` and flooring per step would compound float error […]
  > Math.floor everywhere […] Never Math.trunc — it differs on negatives."
- **Replace** the body of `savingPace` in `src/app/api/dashboard/ceiling.helper.ts`
  (its one call site is `payload.helper.ts:37`, unchanged). Today it reads:
  ```ts
  export function savingPace(ceiling: Ceiling): number {
    return Math.floor(PACE_SHARE * ceiling.sustainable);
  }
  ```
- **Delete** `src/app/api/dashboard/sustainable.helper.ts`, its import at
  `ceiling.helper.ts:1`, `sustainable: sustainableRate(ahead)` at
  `ceiling.helper.ts:75`, and the `sustainable` field in `types.ts:41-43`.
  Verified: `sustainable` has exactly one runtime reader — `savingPace`.
- **`ceiling.months` is never empty**, so the divisor is safe. Three
  independent guarantees say so; the tightest is `service.ts:25-28`, which
  answers `out_of_range` before a payload exists when the current month falls
  outside the range, and `payload.helper.ts:50-54`, which already trusts
  `ceiling.months.length` as `monthsAhead`. Use that same length.
- **Every budget can legitimately be 0** — a red period zeroes them all
  (`ceiling.helper.ts:43-58`), and so does a non-red period whose first
  `worstAhead` is 0. Both give `pace === 0`, which is the path
  `goals.helper.ts:38` already guards with `pace > 0 ? … : null`. No new guard.
- **Stale prose that now states the opposite of the truth** — rewrite, do not
  just delete. `hints.ts` (`HINTS.goals`) currently reads:
  > "Quanto dá para guardar por mês: 25% do valor FIXO que o período sustenta
  > todo mês. Não é 25% do número grande do Teto de Gastos […]"
  It is now precisely a share of the Teto figures. Same for `GoalsTab/hook.ts`,
  whose `caption` says `"ritmo que o período sustenta todo mês"` and whose
  8-line comment above it argues at length for the formula being replaced.
- **The banner facts**: `covered` in `GoalsTab/hook.ts` counts
  `goal.doneMonth !== null`. `doneMonth` survives task 03 but is restructured
  in task 04, and the owner replaced this fact with the goal count — which is
  also the divisor metric B needs. `total` (`formatMoneyShort` of the summed
  `targetCents`) stays as-is.
- **`.squad/debt.md`** carries an entry at
  `src/app/api/dashboard/goals.helper.ts:34` saying "nobody has decided that
  25% of the ceiling is the right rate […] until the owner revisits the
  Objetivos card". The owner just did. Close it in this task.

## Scope
- In: `src/app/api/dashboard/{ceiling.helper.ts,sustainable.helper.ts,types.ts}`,
  the capacity banner's hook/markup, `hints.ts`, `.squad/debt.md`.
- Out: `GoalProjection`'s shape and the goal cards themselves (task 04),
  `buildCeiling`'s per-month arithmetic — the ceiling figures do not change,
  only what is derived from them.

## Verify
```
npm run lint
npm run build
npm run test
```
Then measure the real number rather than assuming one: with the dev server up,
`curl -s 'http://localhost:3000/api/dashboard?owner=familia' | jq '.data.pace,
([.data.ceiling.months[].budget] | add / length)'` — the first must equal
`floor(second / 4)`.

## Forbidden
- Do not filter the zero-budget months out of the average. The owner chose
  "todos os tetos disponíveis" over "só os meses com teto > 0"; excluding zeros
  would inflate the capacity of exactly the periods that have none to give.
- Do not include months before the current one. `ceiling.months` already starts
  at the current month; do not average over `points`.
- Do not keep `sustainable` "just in case" — it has no other reader.
