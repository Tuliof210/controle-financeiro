# Suffix minimum plus accumulator in the ceiling payload

## Outcome
- `GET /api/dashboard` carries, per month from the current one to the range end:
  that month's own extra-spending allowance, the worst projected balance from that
  month onward, and what survives every allowance authorised up to it.
- The single headline figure in the payload is the CURRENT month's allowance.
- `pace`, and therefore everything the Objetivos tab renders, is unchanged.
- A red month anywhere ahead still yields a zero ceiling.

## Context

### The formula — integer cents throughout, no float
```
ahead = points.filter((point) => point.month >= currentMonth)   // never empty

// suffix minimum, right to left, O(n)
W[last] = ahead[last].cumulative
W[i]    = Math.min(ahead[i].cumulative, W[i + 1])

C = 0
for i in 0..last:
  budget[i]    = Math.floor((4 * Math.max(0, W[i] - C)) / 5)
  C           += budget[i]
  remaining[i] = W[i] - C

monthly  = budget[0]
tightest = month of the EARLIEST ahead point whose cumulative === W[0]
```
- Spending in month k lowers the cumulative of k **and every month after it**, so
  k's headroom is the worst balance from k onward, never k's own.
- `- C` is the whole point: without it the per-month answers are mutually exclusive
  — exactly why a bare suffix minimum was deleted in PR #82
  (`git show dbe45e7^:src/app/api/dashboard/slack.helper.ts`).
- `(4 * gap) / 5` floored, in that order, never leaves the integers. `0.8 * gap`
  floored at every step compounds error down an N-deep recursion; this repo
  already dodges float the same way (cross-multiplication in the code below).
- `Math.floor`, never `Math.trunc` (`ceiling.helper.ts:23`). `W` is non-decreasing
  and `remaining` provably stays >= 0, so `Math.max(0, ...)` is defensive only —
  keep it, but do not build behaviour on it firing.

### What is being replaced — `src/app/api/dashboard/ceiling.helper.ts:37-63`
The `pin` loop (lines 37-47, the min-of-ratios) and the rows it drives:
```ts
      months: ahead.map((point, j) => ({
        month: point.month, cumulative: point.cumulative,
        remaining: point.cumulative - monthly * (j + 1),
      })),
```

### That pin loop must survive, because Objetivos is out of scope
The pin loop IS the sustainable flat rate, and `savingPace` (line 70) is 25% of
`ceiling.monthly`. `goals.helper.ts:34` then does `accruedCents = pace *
monthsAhead` — arithmetic only valid for a rate that survives being spent every
month, which a front-loaded allowance is not. Owner ruled Objetivos out of this
story ("essa feature será repensada no futuro"), so the way to not touch it is to
keep its input alive: move the pin loop verbatim into its own `*.helper.ts`
exporting the flat rate, add `sustainable: number` to `Ceiling`, and have
`savingPace` read `ceiling.sustainable`. `payload.helper.ts:36-37` then needs no
change at all.

### Types — `src/app/api/dashboard/types.ts:29-46`
`CeilingMonth` becomes `{ month; budget; worstAhead; remaining }` — `cumulative`
loses its last consumer. On `Ceiling`, `monthly` changes meaning to the current
month's allowance and `sustainable` is new; `weekly`, `daily` and `firstRed` keep
their current derivation. The invariants stated there in prose must be rewritten,
not only the fields — in particular the one that guards the card's division:
`monthly > 0` must still imply every `worstAhead` in `months` is positive.

### Red months
`ceiling.helper.ts:51` — `const red = ahead.find((point) => point.cumulative < 0)`
— stays. Today a red month forces `monthly` to 0 through the ratio; a suffix
minimum does not, since a hole in month 3 leaves months 4+ with positive `W`.
Owner's decision: **a red month zeroes the whole ceiling.** Clamp every `budget`
to 0 and `tightest` to null when `red` is found, preserving
`firstRed !== null => monthly === 0` and the card's existing empty state.

### Rewire the one consumer that would stop compiling
`CeilingCard/hook.ts:18-31` reads `month.cumulative` twice (`sharePercent` and
`of`). Point both at `month.worstAhead` so the build stays green — the row's real
anatomy is task 02's job.

### Watch out for
- `ahead` is never empty (`service.ts:28` answers `out_of_range` first), which
  `ceiling.helper.ts:29-31` documents as the reason there is no guard. Do not seed
  the suffix or the accumulator from a sentinel: the deleted helper used
  `Number.POSITIVE_INFINITY`, and `Infinity - Infinity` is `NaN`.
- `cumulative` is a stock including past months. `ahead` already excludes them;
  nothing in the accumulator may reach behind `currentMonth`.
- `goals.helper.ts:55-57` relies on `ceiling.months.length >= 1` with no guard —
  never shrink the months array.

## Scope
- In: `src/app/api/dashboard/ceiling.helper.ts`, `src/app/api/dashboard/types.ts`,
  one new `src/app/api/dashboard/*.helper.ts` for the flat rate, and the two-line
  read swap in `CeilingCard/hook.ts`.
- Out: `series.helper.ts`, `goals.helper.ts`, `limit.helper.ts`,
  `payload.helper.ts`, `service.ts`, `route.ts`, Prisma schema and migrations, the
  card's markup and copy, `hints.ts`, every e2e file.

## Verify
```
wc -l src/app/api/dashboard/*.ts
npm run lint
npm run build
```
Then with `npm run dev` up, for an owner named by `GET /api/people`:
```
curl -s 'http://localhost:3000/api/dashboard?owner=NAME' | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const m=JSON.parse(s).data.ceiling.months;let c=0,w=-Infinity;for(const r of m){c+=r.budget;if(r.worstAhead<w||r.remaining<0||r.remaining!==r.worstAhead-c)throw new Error(JSON.stringify(r));w=r.worstAhead;}console.log(m.length,"rows ok");})'
```
`e2e/ceiling.spec.ts` is expected to be RED after this task — task 03 owns it.

## Forbidden
- No float in the recursion: no `0.8 *`, no division without `Math.floor`, no
  `Math.trunc`, no `toFixed`.
- Do not change what `savingPace` returns for any input the old code saw, and do
  not change its signature away from taking the `Ceiling`.
- No new fetch, no client-side projection math, no memoisation or caching — every
  derived number in this repo is recomputed per request.
- Do not delete `firstRed` or the empty state it drives.
