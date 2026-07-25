# The four list cards: folga, uso da meta, cobertura, objetivos

## Description

The last four cards of the dashboard. Each renders a block that task 02's
endpoint already computed — none of them derives a number.

**1. Folga de gastos** (`data.slack`) — one row per month from the current
month to the range end. Each row shows a bar plus three figures: what is safe
to spend that month in total, per week (`total / 4`) and per day
(`total / 30`). The bar encodes the row's `total` relative to the largest
`total` in the list, so the shape of the runway is visible at a glance.

**2. Uso da meta mensal** (`data.limit`) — one row per month of the **whole**
range showing what percentage of `Settings.monthlyGoalCents` that month's
effective expense consumed. **≤ 100% is good, > 100% is bad** — that polarity
is the point of the card. When `limit.goalCents` is `null` (no monthly goal
saved), every `percent` is `null` and the card renders an empty state
pointing at Configurações.

**3. Cobertura do previsto** (`data.coverage`) — a headline percentage plus
the elapsed months that still have unrecorded commitments, worst first. This
is a **stale-data signal**, not an accuracy score: "março tem R$ 4.200
previstos e só R$ 900 lançados" means March needs entries, not that a forecast
was wrong. The copy must not imply the plan was wrong. When
`coverage.percent` is `null` (nothing committed in any elapsed month), render
an empty state.

> Flagged in task 02's review, decide when you build this card: "elapsed"
> includes the **current, only partially-elapsed month**, so it will almost
> always sit at the top of the worst-first list purely because the month is not
> over yet. That is the spec as written (`rangeStart .. min(currentMonth,
> rangeEnd)` inclusive), and it is not a bug — but if the card reads as noisy
> because of it, that is a scope question for the owner, not something to
> silently change in the helper.

**4. Objetivos** (`data.goals`) — one row per saved `Goal` with its target and
how many months until it is reached at the current pace, or *"inalcançável no
ritmo atual"* when `months` is `null`. With no goals saved, an empty state
pointing at Configurações.

Three of the four are "a labeled horizontal meter with a tone and some
figures". Per the recursion rule in `.squad/ARCHITECTURE.md` — any internal
JSX structure repeated more than once becomes a child component — extract a
single `MeterRow` and use it from all three. Objetivos has no meter and stays
a plain list.

## When to run

- Depends on: task 02 (the `slack` / `limit` / `coverage` / `goals` payload
  blocks), task 03 (`SectionCard`'s `hint`), task 04 (owns
  `DashboardScreen/index.tsx` and the grid)
- Parallel-safe with: none — task 05 also extends
  `DashboardScreen/index.tsx`, so run after it

## How-to

### Files

```
src/app/_components/DashboardScreen/components/MeterRow/           # index.tsx, hook.ts, style.module.scss
src/app/_components/DashboardScreen/components/SlackCard/          # idem
src/app/_components/DashboardScreen/components/LimitCard/          # idem
src/app/_components/DashboardScreen/components/CoverageCard/       # idem
src/app/_components/DashboardScreen/components/GoalsCard/          # idem
```

Edited: `src/app/_components/DashboardScreen/index.tsx` (mount the four cards
in the grid).

Every one is the mandated three-file folder — `index.tsx` blindly calls its
`hook.ts` and renders what comes back, with no logic, state or effects of its
own. All five are route-local under `DashboardScreen/components/`; the
promotion rule moves a component to `src/components/` only when something
outside its parent's scope uses it.

### `MeterRow`

```ts
export type MeterRowProps = {
  label: string;                          // usually formatYyyymm(month)
  percent: number;                        // 0..100+, clamped for the bar's width only
  tone: "positive" | "negative" | "neutral";
  children: ReactNode;                    // the row's figures
};
```

A `<li>` with the label, a track/fill bar and the caller's figures. Clamp the
fill's width at 100% while letting the caller show the true percentage in
text — a 140% month must read as 140%, not as a full bar with no explanation.

The bar is a data encoding, so it must not be the only signal:
`role="img"` with an `aria-label` stating the label and value, or an
equivalent — the codebase's rule (`src/styles/README.md` rule 7) is that
meaning is never colour-only. Follow the `▲`/`▼` glyph pattern already used in
`src/styles/docs/Colors.mdx` for the good/bad polarity in `LimitCard`.

Styling: `--color-border-subtle` for the track, the tone's semantic token
(`--color-positive` / `--color-negative` / `--color-text-muted`) for the fill,
`--radius-0`, height from a spacing token, transition on `--duration-base`.

### The three meter cards

All three wrap `SectionCard` (title + icon + `hint`) and render a `<ul>` of
`MeterRow`s, matching `EntrySection`'s list pattern
(`display: flex; flex-direction: column; gap: var(--space-2); margin: 0;
padding: 0; list-style: none;`).

**`SlackCard`** — `percent = row.total / max(all totals) × 100`; compute the
max once in the hook, and guard `max === 0` (an all-negative range gives every
row `total: 0`) so you never divide by zero. Tone is always `positive`,
except render the whole list as a muted empty-ish state when every total is
`0` — *"Sem folga no período: o saldo acumulado projetado não cobre gastos
adicionais."* Figures per row: total, `/semana`, `/dia`, all through
`formatMoney` from `@/lib/money`.

**`LimitCard`** — `percent = row.percent`; tone is `positive` when
`percent <= 100`, `negative` above. Show `row.percent` as text (`"140%"`) plus
`formatMoney(row.spent)`. `goalCents === null` → skip the list entirely and
render the empty state.

**`CoverageCard`** — a headline `coverage.percent` above the list, then a
`MeterRow` per month in `coverage.months` with
`percent = recorded / committed × 100` and tone `negative` (each entry is by
definition a shortfall). Figures: `formatMoney(gap)` as the missing amount,
with `recorded` / `committed` as context.

### `GoalsCard`

A plain `<ul>`, no meter: goal name, `formatMoney(targetCents)`, and either
`"~N meses"` or `"inalcançável no ritmo atual"`. Empty list → *"Nenhum
objetivo cadastrado ainda."* with a link to `/configuracoes`, echoing the
existing empty-state pattern (`<p className={styles.empty}>` inside a
`SectionCard`, as in `EntrySection`, `PeopleSection`, `GoalsSection`).

Note that `GoalsSection` on the Settings screen currently renders
`<span className={styles.placeholder}>— progresso em breve</span>` — that
placeholder is about the Settings screen, not this card. Leave it alone;
removing it is a separate change.

### Formatting rules

`formatMoney` from `@/lib/money` (task 01) everywhere — signed and
thousands-grouped. Never `formatCents`, which applies `Math.abs` and would
render a negative figure as positive. Months through `formatYyyymm` from
`@/lib/months` → `"Ago/26"`.

Every number uses `--font-mono` with `font-variant-numeric: tabular-nums`
(`src/styles/README.md` rule 4) so the columns line up down the list. No
hardcoded colour, spacing, radius, shadow or duration anywhere.

### Tooltip copy (`hint`, Portuguese)

- **Folga** — *"O quanto dá para gastar a mais em cada mês sem furar nenhum
  mês seguinte: 80% do menor saldo acumulado de aqui até o fim do período.
  Semanal divide por 4, diário por 30."*
- **Uso da meta** — *"Quanto das saídas de cada mês consumiu da meta mensal
  definida em Configurações. Até 100% está dentro; acima disso, estourou."*
- **Cobertura** — *"Dos compromissos previstos para os meses já decorridos,
  quanto já foi de fato lançado. Percentual baixo costuma significar
  lançamentos em atraso, não erro de previsão."*
- **Objetivos** — *"Meses para alcançar cada objetivo guardando 25% da menor
  folga do período todo mês."*

### Mounting

Add the four `SectionCard`s to `DashboardScreen`'s grid after the charts. They
are normal-width cells (no `.wide`), so at `lg` the grid's three columns give
three cards on one row and the fourth below — check that it does not look
lopsided and adjust the ordering, not the grid, if it does.

### No component test

Vitest runs in the `node` environment: jsdom is not installed and
`@testing-library/react` is not a dependency, so components cannot be tested
today — all 16 existing test files target pure functions. The only candidate
here is `SlackCard`'s max-and-percent derivation; if it grows past a couple of
lines, extract it to a colocated `*.helper.ts` with a `*.test.ts` covering the
`max === 0` case. Otherwise say so in the PR.

### Verification

```bash
npm install && npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

`npm install` first — this branch inherits the `@visx/*` dependencies task 05
added with an empty `node_modules`, and Node's parent-directory walk-up can
mask the gap until `next build` bundles. `npm run db:setup` too: the SQLite
file is gitignored and not shared across worktrees.

Baselines on `main` (anything beyond these is yours): `npm run lint` exit 1
with exactly 2 errors in `.design-sync/gen-cards.mjs`; `npm run test` exit 0
with the pre-existing 16 files / 95 tests plus what earlier tasks added;
`npx tsc --noEmit` exit 2 with exactly 1 error in
`theme.helper.test.ts(21,22)`; `npm run build` exit 0.

Biome enforces 100 lines per file and per function, 2-space indent, double
quotes, line width 80, `organizeImports` as an error, and `noArrayIndexKey` —
key every row by its YYYYMM or goal id, never by array index.

Drive it in the browser (dev server from inside the worktree on a spare port,
then `preview_start` with `{url: "http://localhost:<port>"}`; the `{name}`
launcher runs from the main checkout, not a worktree). Cover every state:

- folga: a healthy range (descending bars from a tight current month) and a
  range with no headroom at all (every total `0`)
- uso da meta: at least one month under 100% and one over, then clear
  `monthlyGoalCents` in Configurações → the empty state appears
- cobertura: a month with commitments and no movements → it tops the list;
  record the matching movements → it drops off
- objetivos: with goals saved and with none; a pace of `0` → every row reads
  "inalcançável no ritmo atual"
- switch the header profile → all four cards re-render with that person's
  numbers
- toggle the theme and narrow to mobile

React state updates are async — after a synthetic click, read the resulting
state in a **separate** `javascript_tool` call, and confirm a click actually
fired via `read_network_requests` rather than trusting the click tool's own
success message.
