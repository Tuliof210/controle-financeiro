# The two charts (visx): monthly bars + cumulative balance line

## Description

Add the two time-series charts to the dashboard grid. The x-axis of both is
the global range, month by month; the y-axis is money in cents.

**1. Evolução mensal — grouped bars, non-cumulative.** For each month of the
range, one income bar and one expense bar side by side. A bar whose *estimate*
beat its actuals is a projection, not history, and renders at **50% opacity**;
a bar whose actuals won renders fully opaque. The flags are already on the
payload: `point.incomeEstimated` and `point.expenseEstimated`, computed by
task 01 — do **not** re-derive them by comparing numbers in the component.

**2. Saldo acumulado — connected points.** One point per month for
`point.cumulative`, connected into a line. The line is **solid** up to the
first month where an estimate beat the actuals and **dashed** from that month
onward — everything past that boundary is projection. The boundary is
`data.dashedFrom` (a YYYYMM, or `null` when every month is real-dominant, in
which case the whole line is solid).

Neither chart computes anything: task 01's endpoint produced `points`,
`cumulative` and `dashedFrom`. This task is scales, axes and marks.

### Why visx

visx composes primitives instead of theming a finished chart. Both annotation
rules land as ordinary props on a primitive — `fillOpacity` per bar,
`strokeDasharray` on a second `LinePath` — rather than as escape hatches
through a chart library's theme. And because every mark is a plain SVG
element, DS tokens go straight into presentation attributes
(`fill="var(--color-positive)"`), which satisfies the "never hardcode a
colour" rule with no override layer at all.

Packages to add, all `^4.0.0` (their declared peer range is
`react: "^18.0.0 || ^19.0.0"`, and this project is on React 19.2.4 — no
`--legacy-peer-deps` needed):

```
@visx/scale  @visx/shape  @visx/axis  @visx/group  @visx/responsive
```

Deliberately **not** added:

- `@visx/tooltip` — SVG `<title>` gives a native per-datum hover tooltip with
  zero JS. The card-level explanatory tooltips are task 03's component.
- `@visx/grid` — a `<line>` per `yScale.ticks()` value is about five lines.
- `@visx/curve` — `LinePath` is linear by default; the line is straight
  segments between months.

Heads-up: `@visx/scale`, `@visx/shape`, `@visx/grid`, `@visx/group`,
`@visx/responsive` and `@visx/curve` are **already on disk** at
`4.0.1-alpha.0` as transitive dependencies of `prisma`'s studio-core. They are
phantom deps — importing them without declaring them would work today and
break on any Prisma bump. Add explicit `package.json` entries for every
package you import. `@visx/axis` is not installed at all.

## When to run

- Depends on: task 04 (owns `DashboardScreen/index.tsx` and the grid's `.wide`
  modifier), task 01 (the payload types and `formatMoneyShort`)
- Parallel-safe with: none — task 06 also extends `DashboardScreen/index.tsx`

## How-to

### Files

```
src/app/_components/DashboardScreen/components/MonthlyBarChart/index.tsx
src/app/_components/DashboardScreen/components/MonthlyBarChart/hook.ts
src/app/_components/DashboardScreen/components/MonthlyBarChart/style.module.scss
src/app/_components/DashboardScreen/components/BalanceLineChart/index.tsx
src/app/_components/DashboardScreen/components/BalanceLineChart/hook.ts
src/app/_components/DashboardScreen/components/BalanceLineChart/style.module.scss
src/app/_components/DashboardScreen/components/<Chart>/chart.helper.ts   # + .test.ts, see below
```

Edited: `package.json` / `package-lock.json`,
`src/app/_components/DashboardScreen/index.tsx` (mount both charts in the grid
with the `.wide` modifier task 04 added).

Route-local under `DashboardScreen/components/` — the promotion rule moves a
component up only when a second consumer outside its parent's scope needs it,
and nothing else charts anything yet. Do not pre-promote to
`src/components/`.

### Shared scale/geometry logic → a tested helper

Components cannot be tested: Vitest runs in the `node` environment, jsdom is
not installed and `@testing-library/react` is not a dependency (the
`@testing-library/*` packages in `node_modules` are phantom transitive deps of
Storybook). All 16 existing test files target pure functions.

So extract the non-trivial geometry into a pure `chart.helper.ts` with a
colocated `*.test.ts`. At minimum:

```ts
// The y domain must include 0 so the baseline is real, and must handle an
// all-negative cumulative series (the balance line legitimately goes below 0).
yDomain(values: number[]): [number, number]
// Index of the first point at or after `dashedFrom`; -1 / null when the whole
// line is solid. The solid and dashed LinePaths must SHARE this point or the
// line visibly breaks.
dashSplit(points: MonthPoint[], dashedFrom: number | null): { solid: MonthPoint[]; dashed: MonthPoint[] }
// Every Nth month label when the range is long, so a 36-month axis does not
// collapse into unreadable overlap.
axisTickMonths(months: number[], maxTicks: number): number[]
```

Test `dashSplit` for: `dashedFrom === null` (all solid, `dashed` empty),
`dashedFrom` on the first month (all dashed), `dashedFrom` in the middle (the
boundary point appears in **both** arrays), and a single-month range. Test
`yDomain` for all-positive, all-negative, mixed, and a single value.

### Sizing

Wrap each chart's `<svg>` in `ParentSize` from `@visx/responsive` so it fills
its grid cell and reflows when the sidebar toggles. Fixed height (a token
multiple, e.g. `--space-24` × 3-ish via the stylesheet, not a magic number in
JS); width from `ParentSize`. Guard against a `width` of `0` on the first
render — return `null` rather than building a scale with a zero range.

Margins for the axes: keep them in the hook as named consts, and make the left
margin wide enough for `formatMoneyShort` output on the biggest value.

### Bar chart specifics

Two band scales: an outer `scaleBand` over `months` (the group), an inner
`scaleBand` over `["income", "expense"]` with a small `padding`. `BarGroup`
from `@visx/shape` gives you `barGroups.map(bg => bg.bars.map(bar => …))`,
which is where the per-bar opacity goes; a manual double-band with plain
`<rect>` is equally fine and shorter — pick one and say why in the PR.

```tsx
fill={bar.key === "income" ? "var(--color-positive)" : "var(--color-negative)"}
fillOpacity={isEstimated ? 0.5 : 1}
```

`isEstimated` reads `point.incomeEstimated` / `point.expenseEstimated`. 50%
opacity is a data encoding, not decoration, so it must not be the only signal:
give each bar a `<title>` that names the month, the value (`formatMoney`) and
whether it is a projection — e.g. `Mar/26 · Entradas · R$ 5.400,00 ·
previsto`. That is the native SVG tooltip, and it also lands the information
in the accessibility tree.

### Line chart specifics

`scaleBand` (or `scalePoint`) on x to stay aligned with the bar chart's month
positions, `scaleLinear` on y over `yDomain(cumulative values)`.

Two `LinePath`s from `@visx/shape` over `dashSplit`'s two arrays — the second
with `strokeDasharray`. Both `stroke="var(--color-brand)"`,
`strokeWidth` from `--border-2`'s value passed as a number (or just `2`; if
you hardcode it, note in the PR that SVG `stroke-width` takes a number and the
token is a length — prefer reading the token via CSS on the element and
leaving `strokeWidth` unset if that works).

A `<circle>` per point on top of the line, each with a `<title>` naming the
month and the cumulative value. Points in the dashed region get the same
treatment — they are still real data points, just projected.

Draw a zero baseline (`<line>` at `yScale(0)` in `--color-border-subtle`)
whenever the domain crosses zero — without it a negative cumulative balance
reads as "a bit lower" instead of "underwater".

### Axes and gridlines

`AxisBottom` / `AxisLeft` from `@visx/axis`.

- x tick labels: `formatYyyymm` from `@/lib/months` → `"Ago/26"`. Thin them
  with `axisTickMonths` — the live database has a 36-month range.
- y tick labels: `formatMoneyShort` from `@/lib/money` (task 01) → `"R$ 1.234"`,
  no cents.
- Style axes through `tickLabelProps` / `stroke` props with token values:
  `stroke="var(--color-border)"`, label `fill="var(--color-text-muted)"`,
  `fontFamily="var(--font-mono)"`, `fontSize` from `--text-2xs`/`--text-xs`.
- Gridlines: `yScale.ticks(n).map(v => <line … stroke="var(--color-border-subtle)" />)`
  inside a `<Group>`. No `@visx/grid`.

CSS custom properties resolve inside SVG presentation attributes, so tokens
work here exactly as they do in a stylesheet — and they follow the runtime
theme switch for free. Verify that in the browser in both themes; it is the
whole reason for doing it this way.

### Mounting

Both charts go in `DashboardScreen`'s grid with the `.wide` class task 04
added (`grid-column: 1 / -1`). Wrap each in a `SectionCard` with a `hint`
(task 03) explaining its rule, in Portuguese:

- bars — *"Cada mês usa o maior valor entre lançado e previsto. Barras com 50%
  de opacidade são meses em que o previsto superou o lançado, ou seja,
  projeção."*
- line — *"Saldo acumulado mês a mês. A linha fica tracejada a partir do
  primeiro mês em que o previsto superou o lançado."*

Empty axis: `status: "ok"` guarantees a non-empty range (task 01 returns
`no_range` when `buildMonths` is empty), but a one-month range is possible —
make sure a single band does not divide by zero.

### Verification

```bash
npm install && npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

`npm install` is **mandatory** here, and specifically before `npm run build` —
this task adds five packages, and a worktree's `node_modules` starts empty
while Node's parent-directory walk-up to the main checkout can resolve
pre-existing packages and mask the gap until bundling. The already-on-disk
`@visx/*` alphas make this trap worse than usual: lint, test and tsc can all
pass against Prisma's transitive copies while `package.json` is missing the
entries. After installing, confirm the five names are actually in
`package.json`'s `dependencies` and that `npm ls @visx/axis` resolves at the
root, not only under `prisma`.

Baselines on `main` (anything beyond these is yours): `npm run lint` exit 1
with exactly 2 errors in `.design-sync/gen-cards.mjs`; `npm run test` exit 0
with the pre-existing 16 files / 95 tests plus what earlier tasks added;
`npx tsc --noEmit` exit 2 with exactly 1 error in
`theme.helper.test.ts(21,22)`; `npm run build` exit 0.

Biome: 100 lines per file **and per function**, 2-space indent, double quotes,
line width 80, `organizeImports` as an error, `noArrayIndexKey` from the react
domain — key every bar, point and gridline by its YYYYMM (or tick value),
never by array index. Chart components hit the line cap fast; split render
helpers into child components rather than deleting comments.

Drive both charts in the browser (start the dev server from inside the
worktree on a spare port, then `preview_start` with
`{url: "http://localhost:<port>"}` — the `{name}` launcher runs from the main
checkout, not a worktree). Seed the database so all the states are visible:

- a month with movements above its recurrences → both bars fully opaque
- a month with no movements at all → both bars at 50% opacity
- a mixed month (income recorded, expense not) → one bar opaque, one at 50%
- the line goes solid → dashed at exactly the first projected month
- a range where nothing is projected → the line is fully solid
- a negative cumulative balance somewhere → the zero baseline reads correctly
- hover a bar and a point → the `<title>` tooltip shows the right values
- toggle the theme → every stroke, fill and label follows
- resize to mobile and collapse the sidebar → the charts reflow via
  `ParentSize`

Screenshot the charts in both themes for the PR.
