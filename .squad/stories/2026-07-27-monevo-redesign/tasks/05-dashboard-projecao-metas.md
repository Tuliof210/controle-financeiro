# Dashboard — the `Projeção` and `Metas` tabs

## Description
Task 04 built the tab shell and filled `Visão geral`, which left the Folga,
Meta and Objetivos cards homeless. This task gives them their tabs and rebuilds
them to the design.

**`Projeção`** is two cards side by side — Folga de gastos and Uso da meta
mensal. Today both render every month of the range as an unbounded meter list;
the design caps them at 8 rows behind a `Ver todos (N)` / `Mostrar menos`
toggle, and gives each row a wider anatomy: the month, the figure, the
secondary figures, and a full-width bar underneath rather than beside.

**`Metas`** is a savings-capacity banner plus a grid of goal cards. This is the
tab that needed the most care during refinement, because the design's goal card
reads "R$ 12k **de** R$ 50k" — money already set aside — and that number does
not exist. There is no `savedCents` on `Goal`, no contributions table, nothing.

**What the bar measures instead, decided during refinement:** `accruedCents /
targetCents` — how much of the goal the **projected slack covers before the
range ends**. `accruedCents` is already in the payload (`pace × monthsAhead`).
The bar's length, its tone and the row's own words must all say that one thing;
`.squad/learnings.md` (2026-07-25) records a meter shipping backwards here
because its length measured one quantity while its colour and label measured
another. So the row text is literally *"o período cobre R$ 12k de R$ 50k"* —
not "R$ 12k de R$ 50k", which would read as money in the bank.

No new fetch, no new field, no new endpoint. Everything comes from the
`GET /api/dashboard?owner=…` the screen already makes.

## When to run
- Depends on: 04-dashboard-geral.md (builds `Board`'s tab router, `TabBar`, and
  the `GeneralTab` this task's panels sit beside). Run after it merges and
  `git fetch origin main` first.
- Parallel-safe with: 06, 07 and 08 — no shared file.

## How-to

### Files
```
src/app/_components/DashboardScreen/components/Board/index.tsx                (edit: two branches)
src/app/_components/DashboardScreen/components/ProjectionTab/ index|hook|style (new)
src/app/_components/DashboardScreen/components/GoalsTab/      index|hook|style (new)
src/app/_components/DashboardScreen/components/SlackCard/  index|hook|style|hook.test.ts (edit)
src/app/_components/DashboardScreen/components/LimitCard/  index|hook|style|hook.test.ts (edit)
src/app/_components/DashboardScreen/components/GoalsCard/  → replaced by GoalCard + the banner
src/app/_components/DashboardScreen/components/GoalCard/   index|hook|style + hook.test.ts (new)
src/app/_components/DashboardScreen/components/MeterRow/   style.module.scss  (edit)
src/app/_components/DashboardScreen/hints.ts                                  (edit if card keys move)
src/app/_components/DashboardScreen/list-cards.helper.ts + .test.ts           (edit if it names cards)
```

Every new component folder is the three files: `index.tsx` blindly calls the
folder's `hook.ts` and renders JSX with **no logic, state or effects**;
`hook.ts` holds everything else; `style.module.scss` uses `@use "theme" as t;`
and `var(--token)` only.

### 1. `Board` — wire the two branches
```tsx
{tab === "projecao" ? <ProjectionTab data={data} /> : null}
{tab === "metas" ? <GoalsTab data={data} /> : null}
```
Nothing else in `Board` changes.

### 2. `ProjectionTab` layout
```scss
.tab { display: grid; grid-template-columns: 1fr; gap: var(--space-6);
  @include t.bp("md") { grid-template-columns: 1fr 1fr; } }
```
Holds `<SlackCard>` and `<LimitCard>`, in that order.

### 3. The show-all toggle — one behaviour, two cards
Both cards need `useState(false)` plus a slice. Do **not** write it twice:
put it in a sibling hook both cards call.

```ts
// src/app/_components/DashboardScreen/show-all.hook.ts
// Named for its role, not `hook.ts`: a folder's hook.ts is called by its OWN
// index.tsx, and this one is called by two other components' hooks.
export function useShowAll<T>(rows: T[], cap = 8) {
  const [all, setAll] = useState(false);
  return {
    rows: all ? rows : rows.slice(0, cap),
    toggle: () => setAll((v) => !v),
    label: all ? "Mostrar menos" : `Ver todos (${rows.length})`,
    hidden: rows.length > cap,   // no toggle at all when everything fits
  };
}
```
`hidden` matters: with a 6-month range the toggle would say "Ver todos (6)"
above six visible rows. Render the button only when `rows.length > cap`.

The toggle button sits in the card's title row, right-aligned:
`min-height: 44px` (the design draws a bare `--space-1 --space-2` chip — the
hit-target floor wins; if the padding shifts the title row, use the centred
44×44 `::after` overlay that `Tooltip` uses), transparent,
`--border-1 solid var(--color-border)`, `--radius-sm`, `--text-2xs`, muted,
hovering to `--color-surface-raised` and `--color-text`.

`SectionCard` does not take a header action today. Rather than widening it for
two call sites, render the button as the first child of the card body inside a
`.cardHead` row with the description `<p>` — the design's own layout has the
description directly under the title anyway.

### 4. `SlackCard` and `LimitCard` — the new row anatomy
Today both render `MeterList` → `MeterRow`, which puts the figures on the head
line and a thin `--space-2` track underneath. The design keeps exactly that
shape, so **reuse `MeterRow`** rather than writing a third row component. What
changes:

- `MeterRow`'s track grows to `height: 8px` and gains
  `border-radius: var(--radius-sm)`; the fill inherits it.
- Rows are separated by `border-top: var(--border-1) solid
  var(--color-border-subtle)` and `padding: var(--space-3) 0`, replacing the
  list's `gap`.
- **Projected months are hatched, not solid.** The design distinguishes future
  months with `repeating-linear-gradient(45deg, <tone> 0 3px, transparent 3px 6px)`
  on the slack bar and `opacity: .55` on the meta bar. Both `SlackMonth` and
  `LimitMonth` cover months the payload already marks — derive "projected" from
  `month > range.current`, which the tab has. Add a `projected?: boolean` to
  `MeterRow`'s props and a `.projected` class; do **not** put the gradient in a
  style attribute.

Three `MeterRow` invariants that a restyle can silently destroy:
- `role="img"` must stay **on the element carrying `aria-label`**. Moving the
  label to the inner `.fill` makes screen readers announce nothing.
- `fill` is a **percentage string** (`"58.02%"`, `"100%"`, `"0%"`) and
  `MeterRow/hook.test.ts` asserts those exact strings. Switching to
  `transform: scaleX()` or a CSS custom property breaks them.
- `styles[tone]` is a dynamic CSS-Modules lookup over `.positive` / `.negative`.
  Renaming those classes breaks the colour with **no compile error and no test
  failure**.

`SlackCard`'s figures stay `total`, `{weekly}/sem`, `{daily}/dia`; `LimitCard`'s
stay `spent` plus `▲/▼ {percent}%` with the text uncapped and the bar capped.
Both keep their `srLabel` strings and their empty states verbatim — those are
asserted in `SlackCard/hook.test.ts:43` and `LimitCard/hook.test.ts:42-44`.
`LimitCard`'s `▲` means "over the ceiling", the **inverse** of `StatCard`'s
directional `▲`; leave it alone.

Both cards keep their `hints.ts` tooltip copy. If a card's key moves in that
file, update `hints.ts` and `list-cards.helper.ts` together, with their test.

### 5. `GoalsTab` — the capacity banner
A single full-width section, `background: var(--color-surface-raised)`,
`--border-2 solid var(--color-border)`, `--radius-md`, `padding: var(--space-6)`,
flex-wrap row:

- Left: eyebrow `CAPACIDADE DE POUPANÇA` (`--font-display`, `--text-2xs`,
  `--tracking-wide`, `--color-brand`), then `formatMoney(data.pace)` at
  `--text-2xl` with a muted ` /mês` suffix at `--text-sm`, then the muted
  caption `guardando 25% da menor folga do período` — which is exactly what
  `pace` is (`floor(0.25 × min(slack.total))`), so the sentence is true.
- Right: two facts — `CONCLUÍDAS` as `${goals.filter(fundedInPeriod).length} / ${goals.length}`
  and `TOTAL EM METAS` as `formatMoneyShort(sum of targetCents)`.

"Concluídas" here means **funded inside the period** (`doneMonth !== null`), not
"already achieved" — there is no achieved state. Label it `COBERTAS NO PERÍODO`
rather than `CONCLUÍDAS` so the banner does not claim something the data cannot
support. That is a deliberate copy deviation from the design; note it in the PR.

When `pace === 0` the banner shows `R$ 0,00 /mês` and the caption becomes
`sem folga projetada no período` — do not divide by it anywhere.

### 6. `GoalCard` — one card per goal
```scss
.grid { display: grid; grid-template-columns: 1fr; gap: var(--space-6);
  @include t.bp("md") { grid-template-columns: repeat(2, 1fr); } }
```
`hook.ts` is **pure — no React hook** — so it is directly testable and gets
`hook.test.ts`. Per `GoalProjection` (`{ id, name, targetCents, months,
doneMonth, accruedCents, neededCents }`) it returns:

| field | value |
|---|---|
| `percent` | `min(100, round(accruedCents / targetCents × 100))`, and `0` when `targetCents` is 0 |
| `covered` | `` `o período cobre ${formatMoneyShort(min(accruedCents, targetCents))} de ${formatMoneyShort(targetCents)}` `` |
| `badge` | `` `${percent}%` `` |
| `full` | `percent >= 100` — drives the tone and the icon |
| `eta` | `months === null` ? `RITMO ZERO` : `` `~${months} MESES` `` , with ` · CONCLUI EM ${formatYyyymm(doneMonth)}` appended when `doneMonth` is set, and ` · ALÉM DO PERÍODO` when it is not |
| `note` | `doneMonth` ? `` `conclui em ${formatYyyymm(doneMonth)} no ritmo atual` `` : `` `precisaria de ${formatMoney(neededCents)}/mês para fechar no prazo` `` |
| `srLabel` | `` `${name}: o período cobre ${percent}% do objetivo` `` |

The card:
```tsx
<section className={styles.card}>
  <div className={styles.head}>
    <div>
      <p className={styles.name}>
        <Target size={15} aria-hidden className={full ? styles.iconFull : styles.icon} />
        {name}
      </p>
      <p className={styles.eta}>{eta}</p>
    </div>
    <span className={`${styles.badge} ${full ? styles.badgeFull : ""}`}>{badge}</span>
  </div>
  <p className={styles.covered}>{covered}</p>
  <div className={styles.track} role="img" aria-label={srLabel}>
    <div className={styles.fill} style={{ width: `${percent}%` }} />
  </div>
  <p className={styles.note}>{note}</p>
</section>
```
Icon: `Target` from lucide, swapping to `Check` when `full` — both already used
in this repo. Track is `height: 12px`, `--border-1 solid
var(--color-border-subtle)`, `--radius-sm`, `overflow: hidden`; the fill is
`var(--gradient-toxic)` normally and `var(--color-positive)` when `full`.

**The bar, the badge and `covered` all state period coverage.** They must not
diverge — if you cap one, cap all three, which is why `covered` uses
`min(accruedCents, targetCents)`.

Note that `accruedCents` is `pace × monthsAhead` and is therefore **identical
for every goal**; the percentages differ only because the targets do. That is
honest for "how much the period covers" and would be a lie for "how much is
saved". Do not re-derive it per goal.

`hook.test.ts`: a goal the period fully covers (`percent === 100`, `full`,
positive tone), one it partly covers, one with `pace === 0` (`months === null`
→ `RITMO ZERO`, `neededCents` note), one with `doneMonth === null` (`ALÉM DO
PERÍODO`), and a `targetCents` of 0 (no division by zero, `percent === 0`).

Empty state, when `goals` is empty: keep today's `GoalsCard` copy and its link
to `/configuracoes` — render it in place of the grid.

`GoalsCard` (the old meter-list version) is **deleted**, along with its
`hook.ts`, `style.module.scss` and `hook.test.ts`. Its `hints.ts` entry moves to
whatever wrapper still wants a tooltip; if nothing does, remove the entry rather
than leaving a dangling key. Note in the PR body that
`GoalsCard/hook.test.ts:48` asserted a whole row with an exact `toEqual` — those
cases are replaced by `GoalCard/hook.test.ts`, not dropped, and the test count
should not go down.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npx vitest run --exclude '**/.claude/**' && npx tsc --noEmit && npm run build
```

Baselines: lint **2 errors + 1 info**, tsc **1 error**, test **45 files / 321
tests** plus whatever earlier tasks added — re-measure on the merged `main`.
Never run `npm run lint:fix`.

**Prove the new tests bite.** Mutate `GoalCard/hook.ts` (drop the `min()`,
flip the `doneMonth` branch) and confirm the suite goes red before reverting.
And after fixing any review finding, test the invariant the fix could break,
not just the property it fixed — `.squad/learnings.md` records that costing two
rounds on an earlier PR.

### Browser check
Start the dev server from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. You need real data:
a range, some movements and recurrences, a monthly goal, and at least three
objectives with different targets.

- `Projeção`: two cards side by side at desktop, stacked at 375px. With a range
  longer than 8 months the `Ver todos (N)` button appears and reveals the rest;
  with a range of 6 months **no button appears at all**.
- A future month's bar is visibly hatched (slack) or dimmed (meta) versus a
  past one. Pick one month either side of the current one and compare.
- Set the monthly goal to `0` in Configurações: the Limit card shows its
  "defina a meta mensal" empty state and **does not** render twelve green
  "0% used" rows. This exact bug shipped once from an untested `empty` guard.
- `Metas`: the banner's capacity matches the pace the Objetivos tooltip
  describes; each goal card's badge equals its bar's width; the text says
  "o período cobre …" and never implies money is saved.
- A goal with a target far beyond the period shows `ALÉM DO PERÍODO` and the
  `precisaria de R$ X/mês` note.
- Delete every goal: the empty state appears with its link to Configurações.
- Both themes, 375px, no console error, no horizontal scroll on the page body.

### Anything else you touch
No API call changes, no change to `DashboardScreen/hook.ts`'s fetch. Switching
to these tabs must still fire **zero** additional `/api/dashboard` requests —
confirm with `read_network_requests`. `MonthlyBarChart`, `BalanceLineChart`,
`ChartFrame` and `chart.config.ts` are not touched.
