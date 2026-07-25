# Fill the Objetivos card body with pace, meters and dates

## Description
"Objetivos" is the thinnest card on the board: a `<ul>` of name, target and
`~N meses`. Task 01 promoted it into the third slot of the last card row;
this task gives it a body worth the slot.

Four additions, all of them derived from data the API already has:

1. **The saving pace as a headline.** `payload.helper.ts` already computes
   `pace` (25% of the tightest slack month) and puts it at the root of the
   payload — and NOTHING renders it. Today the number exists only inside
   `HINTS.goals` as a formula. It becomes the card's headline
   (`R$ 1.240,00`) plus a muted line naming where it comes from.
2. **A meter per goal**, matching the two sibling cards' visual language: bar
   length = the share of the target the global period actually funds
   (`pace × months remaining ÷ target`).
3. **The completion month** — `conclui em Mar/28`, or `além do período` when
   the goal lands past the range end.
4. **The monthly amount that would close it inside the period**
   (`precisaria de R$ 4.166,67/mês`), shown only on the goals the current pace
   does not close.

Plus ordering: soonest-first instead of creation order.

**The invariant that keeps the bar honest** (this repo has already shipped one
meter whose length, colour and label measured three different things — see
`.squad/learnings.md`): with `months = ceil(target / pace)` and
`monthsAhead` = the months from the current month to the range end inclusive,
these three are *the same condition* for integers —

- the goal closes inside the period: `months <= monthsAhead`
- the bar reaches 100%: `pace × monthsAhead >= target`
- a completion month exists inside the range:
  `addMonths(current, months - 1) <= rangeEnd`

So derive ONE flag server-side (`doneMonth !== null`) and let it drive the
date, the tone and the copy. A fuller bar always means "closer to funding this
goal inside the global period", the tone agrees, the sort order agrees
(smaller target ⇒ fewer months ⇒ fuller bar ⇒ higher in the list), and the
row's text states the percentage's meaning.

The pace-of-0 case must not regress: `sharePercent` already guards the
divide, `goalLabel(null)` already reads "inalcançável no ritmo atual", and
every bar goes empty and red.

## When to run
- Depends on: 01-remove-coverage.md (it edits `types.ts`,
  `payload.helper.ts`, `hints.ts` and `Board/index.tsx`, all of which this
  task edits too — run after it merges, and `git fetch origin main` first)
- Parallel-safe with: none

## How-to

### 1. `src/lib/months.ts` — add `addMonths`
There is no month arithmetic helper yet (`buildMonths` enumerates a range;
`composeYYYYMM` / `splitYYYYMM` are the primitives). Add one, going through a
flat month count so the year boundary is arithmetic rather than a branch:

```ts
// YYYYMM advanced by N months. Flat month count, so December -> January is
// arithmetic and not a special case.
export function addMonths(value: number, count: number): number {
  const { year, month } = splitYYYYMM(value);
  const total = year * 12 + (month - 1) + count;
  return composeYYYYMM(Math.trunc(total / 12), (total % 12) + 1);
}
```

Add cases to `src/lib/months.test.ts` (mirror the existing `describe` per
export style): `count = 0` returns the input, a within-year advance, and a
year crossing (`addMonths(202611, 3) === 202702`).

### 2. `src/app/api/dashboard/types.ts` — extend `GoalProjection`
```ts
export type GoalProjection = {
  id: string;
  name: string;
  targetCents: number;
  months: number | null;    // wait at the current pace; null when the pace is 0
  doneMonth: number | null; // YYYYMM the target is reached; null when the
                            // global period does not fund it at all
  accruedCents: number;     // pace * months remaining in the period
  neededCents: number;      // per month, to close inside the period
};
```

### 3. `src/app/api/dashboard/goals.helper.ts` — rewrite `projectGoals`
New signature (breaking; `payload.helper.ts` and the test are the only
callers):

```ts
type Horizon = {
  pace: number;        // cents put aside per month
  monthsAhead: number; // current month .. range end, inclusive
  current: number;     // YYYYMM
};

export function projectGoals(goals: Goal[], horizon: Horizon): GoalProjection[]
```

Per goal:
- `months` — unchanged: `pace > 0 ? Math.ceil(target / pace) : null`.
- `doneMonth` — `months !== null && months <= monthsAhead ?
  addMonths(current, months - 1) : null`. Write the condition inline, not via
  a `const reached` boolean: TypeScript will not narrow `months` out of a
  separate boolean, and this must not need a non-null assertion. The `- 1` is
  deliberate: saving starts in the current month, so a one-month goal
  completes in the current month, not the next.
- `accruedCents` — `pace * monthsAhead`, the same for every goal. Hoist it
  above the `.map`.
- `neededCents` — `Math.ceil(target / monthsAhead)`. `monthsAhead` is `>= 1`
  by construction (the slack list runs current..rangeEnd and `getDashboard`
  already returned `out_of_range` when the current month is outside), so there
  is no divide-by-zero branch — say so in a comment rather than adding a guard.

Then sort soonest-first with the unreachable ones last. Do NOT use
`Number.POSITIVE_INFINITY` as the null stand-in: `Infinity - Infinity` is
`NaN`, and a comparator returning NaN is coerced to 0 by the spec — it happens
to work, but it reads as a bug. Use `Number.MAX_SAFE_INTEGER`, which
subtracts to a clean 0. `Array.prototype.sort` is stable, so ties keep the
repository's `createdAt asc` order.

Extend `goals.helper.test.ts` (its `goal()` factory and existing month-rounding
cases stay, adapted to the new signature). New cases, at minimum:
- `doneMonth` lands on `current` for a goal needing exactly one month;
- `doneMonth` crosses a year boundary correctly;
- `doneMonth` is `null` when `months > monthsAhead`, and in that same case
  `accruedCents < targetCents` — assert BOTH in one test, so the invariant the
  card leans on is what is pinned, not two independent numbers;
- `accruedCents >= targetCents` exactly when `doneMonth !== null`;
- `neededCents` closes the goal inside the period (`needed * monthsAhead >=
  target`);
- pace 0 ⇒ `months` and `doneMonth` null, `accruedCents` 0, `neededCents`
  still finite;
- ordering: three goals of different sizes come back soonest-first with the
  unreachable one last.

### 4. `src/app/api/dashboard/payload.helper.ts` — pass the horizon
```ts
goals: projectGoals(goals, {
  pace,
  monthsAhead: slack.length,
  current: range.current,
}),
```
`slack` and `pace` are already local consts above the return. `payload.helper.test.ts`
has a wiring case (`"derives the pace from the tightest slack month and
projects the goals"`) asserting `data.goals[0].months` — keep it green and add
one assertion that the goals come back sorted.

### 5. `MeterRow` — optional `footer`
`src/app/_components/DashboardScreen/components/MeterRow/` currently renders a
head (label + figures) and a track. The goals row needs a third line, and
duplicating the meter markup inside GoalsCard would undo the extraction that
created MeterRow ("it was byte-identical in each of them"). Add one optional
prop:

- `hook.ts` — `footer?: ReactNode` on `MeterRowProps`, passed straight through.
- `index.tsx` — `{footer ? <div className={styles.footer}>{footer}</div> : null}`
  after the track div.
- `style.module.scss` — `.footer`: `display: flex; flex-wrap: wrap;
  gap: var(--space-1) var(--space-3); color: var(--color-text-muted);
  font-family: var(--font-mono); font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;`
- `hook.test.ts` — one case that the footer passes through, and one that it is
  `undefined` when omitted (SlackCard and LimitCard pass nothing and must be
  visually unchanged).

### 6. `GoalsCard` — rebuild the body
`hook.ts` — props become `{ goals: GoalProjection[]; pace: number }`. Return
`empty`, `headline` (`formatMoney(pace)`) and `rows`, each row:

| field | value |
|---|---|
| `key` | `goal.id` |
| `name` | `goal.name` |
| `percent` | `sharePercent(Math.min(accruedCents, targetCents), targetCents)` — from `../../list-cards.helper`, which already returns 0 when the divisor is 0 |
| `tone` | `goal.doneMonth !== null ? "positive" : "negative"` |
| `funded` | `` `${formatMoneyShort(funded)} de ${formatMoneyShort(goal.targetCents)}` `` |
| `wait` | `goalLabel(goal.months)` — unchanged helper |
| `unreachable` | `goal.months === null` |
| `done` | `null` when `months === null` (the wait already says "inalcançável"); `` `conclui em ${formatYyyymm(goal.doneMonth)}` `` when `doneMonth` is set; `"além do período"` otherwise |
| `needed` | `null` when `doneMonth` is set; else `` `precisaria de ${formatMoney(goal.neededCents)}/mês` `` |
| `srLabel` | `` `${goal.name}: ${Math.round(percent)}% do objetivo financiado até o fim do período` `` |

`funded` is capped at the target on purpose — a bar pinned at 100% next to
"R$ 62.000 de R$ 50.000" reads as a bug. `formatMoneyShort` (not
`formatMoney`) for that pair only: two grouped money values share one line in
a one-third-width card, and the centavos are noise there; the headline and
`needed` keep the full `formatMoney`.

`index.tsx` — headline `<p>` + muted note `<p>` ("por mês, guardando 25% da
menor folga do período") ALWAYS, then either the existing empty state or a
`MeterList` of `MeterRow`s: `label={row.name}`, `children` = one `<span>` with
`row.funded`, `footer` = a fragment of the up-to-three muted spans (`wait`,
`done`, `needed`), with `row.unreachable` selecting the negative-toned class
on the wait span exactly as today's `.unreachable` does.

`style.module.scss` — the old `.list` / `.row` / `.name` / `.target` / `.wait`
classes are dead once MeterRow owns the layout; delete them. Keep `.empty`
(with its `a` + `focus-ring` rules) and `.unreachable`, and add `.headline`
(copy the one in the deleted `CoverageCard/style.module.scss`: `--text-xl`,
`--weight-bold`, tabular-nums) and `.note` (muted, `--text-sm`).

Accept that MeterRow renders the goal name in `--color-text-muted` /
`--text-sm` where the old `.name` used `--color-text` / `--text-base`: that is
the same role the month label plays in Slack and Limit, and matching the
siblings is the point of reusing the component. Do not add a prop to override
it.

`hook.test.ts` — the existing three cases are rewritten against the new shape.
Cover at least: a goal that closes inside the period (positive tone, `done`
set, `needed` null), one that does not (negative tone, `done` = "além do
período", `needed` set), pace 0 (`percent` 0, `unreachable` true, `done`
null), the headline formatting, and `empty` with no goals.

`Board/index.tsx` — `<GoalsCard goals={data.goals} pace={data.pace} />`.

`hints.ts` — rewrite the `goals` entry. It currently only explains the pace
formula; it must now also say what the bar measures (the share of the target
funded by the end of the global period) and that "além do período" means the
goal lands after the range end, not that it is impossible.

### Verify
Run from inside the task worktree, not the main checkout:

```bash
npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

- `npm run test` from the main checkout globs `.claude/worktrees/*` and counts
  other branches' tests — measure from inside the worktree.
- `npm run lint` has a pre-existing error baseline in
  `.design-sync/gen-cards.mjs`; report NEW errors only and never run
  `npm run lint:fix`.
- Watch the 100-line file cap on `GoalsCard/hook.ts` and `goals.helper.ts`.
  Biome reports it as an `info`, not an error, so it will NOT fail the lint
  run — read the `Found N infos` block.

### Browser check
`preview_start`'s `{name}` launcher runs from the MAIN checkout, so start the
dev server manually from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. On `/`, with at least
three goals saved in Configurações (one small enough to close inside the
period, one far too large):

- the small goal is at the top with a green bar and a `conclui em <mês>/<ano>`
  footer; the large one is lower, red, `além do período`, with a
  `precisaria de R$ …/mês`;
- the pace headline matches the money the "Folga de gastos" card implies
  (25% of its smallest month);
- the footer wraps rather than overflowing at `md` (two-column) width and on a
  375px viewport — `resize_window` both;
- no console error, no `NaN` in any bar's inline width (inspect via
  `javascript_tool`), and the card still renders its empty state with every
  goal deleted;
- re-check in dark theme.

Note on contrast: `--color-negative` fails the light theme's body-text
contrast floor and this is PRE-EXISTING and deliberately deferred by the owner
(2026-07-25). Do not special-case the goals card's colour to dodge it, and do
not write "legible in both themes" into the PR body — state what was measured
or say nothing.

### Anything else you touch
State remains untouched: no new dependency, no migration, no route contract
outside the `goals` array of `GET /api/dashboard`, no auth surface.
