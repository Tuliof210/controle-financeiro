# Dashboard — the tab shell and the `Visão geral` tab

## Description
The dashboard stops being one long column of eight cards and becomes three
tabs: `Visão geral`, `Projeção`, `Metas`. This task builds the tab shell and
fills the first tab; task 05 fills the other two.

`Visão geral`, top to bottom:
1. **A hero card** — dark, inverted, with a scanline overlay and a gradient
   rule. It states the projected balance at the end of the configured range,
   how much of that is still ahead of you, and three facts about the period.
   This is new composition over data the payload already carries; nothing is
   fetched that was not fetched before.
2. **Three KPI cards** — today's `StatCard`s, restyled with corner marks, a
   sparkline of their own series, and the design's row labels.
3. **The two existing charts**, full width, unchanged apart from their card.

The cards for Folga, Meta and Objetivos move out of this tab and into task
05's; between the two merges the dashboard is missing them, which is why 05
follows immediately.

Everything comes from the single `GET /api/dashboard?owner=…` call the screen
already makes. **No new fetch, no new endpoint, no new field.**

## When to run
- Depends on: 02-shell.md (`PageHeader` replaces the screen's `<h1>`) and
  03-primitives.md (`SectionCard`'s new eyebrow title). Run after both merge
  and `git fetch origin main` first.
- Parallel-safe with: 06, 07 and 08 — they touch `movimentacoes/`,
  `leitor-ofx/` and `configuracoes/` respectively and share no file with the
  dashboard tree. **Not** parallel-safe with 05, which builds on the tab shell
  this task creates.

## How-to

### Files
```
src/app/_components/DashboardScreen/components/Board/index.tsx | hook.ts | style.module.scss   (rewrite)
src/app/_components/DashboardScreen/components/TabBar/         index|hook|style                (new)
src/app/_components/DashboardScreen/components/GeneralTab/     index|hook|style                (new)
src/app/_components/DashboardScreen/components/HeroCard/       index|hook|style + hook.test.ts (new)
src/app/_components/DashboardScreen/components/StatCard/       index.tsx | hook.ts | style.module.scss | hook.test.ts (edit)
src/app/_components/DashboardScreen/components/ChartCard/      style.module.scss               (edit, maybe)
src/app/_components/DashboardScreen/spark.helper.ts + spark.helper.test.ts                     (new)
src/app/_components/DashboardScreen/list-cards.helper.ts + .test.ts                            (edit if it names cards)
src/app/_components/DashboardScreen/index.tsx | hook.ts                                        (edit: tab state)
```

Every new component folder is the three files: `index.tsx` blindly calls the
folder's `hook.ts` and renders JSX with **no logic, state or effects**;
`hook.ts` holds everything else; `style.module.scss` uses `@use "theme" as t;`
and `var(--token)` only.

### 1. Tab state
`useState<"geral" | "projecao" | "metas">("geral")` in
`DashboardScreen/hook.ts`, passed down to `Board`. **No URL parameter** — this
is a local app with no deep-linking story, and a `?tab=` would mean a
`useSearchParams` + a Suspense boundary for a toggle. **Switching tabs must not
refetch**: the effect that calls `/api/dashboard` is keyed on `profile` only;
do not add `tab` to its dependencies.

### 2. `TabBar` — buttons, not `role="tab"`
```tsx
<div className={styles.bar} role="group" aria-label="Seções do painel">
  {tabs.map((t) => (
    <button key={t.id} type="button" aria-pressed={t.active}
            className={styles.tab} onClick={() => onSelect(t.id)}>
      {t.label}
    </button>
  ))}
</div>
```
Deliberately **not** the ARIA tabs pattern. `role="tab"` promises roving
tabindex and arrow-key navigation; implementing that properly is more code than
this earns, and claiming the role without it is worse than not claiming it.
`aria-pressed` buttons are announced correctly and keyboard-operable with no
extra work. Say this in the PR body so a reviewer does not read it as an
oversight.

```scss
.bar {
  display: flex;
  width: max-content; max-width: 100%;
  overflow: hidden;
  background: var(--color-surface);
  border: var(--border-2) solid var(--color-border);
  border-radius: var(--radius-sm);
}
.tab {
  min-height: 44px;                 // design draws 42; rule 7(e) is a floor
  padding: 0 var(--space-5);
  background: transparent;
  color: var(--color-text-muted);
  border: 0;
  border-right: var(--border-2) solid var(--color-border);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  white-space: nowrap;
  cursor: pointer;
  @include t.focus-ring;

  &:last-child { border-right: 0; }
  &[aria-pressed="true"] {
    background: var(--color-text);
    color: var(--color-bg);
    font-weight: var(--weight-bold);
  }
}
```
Labels: `Visão geral`, `Projeção`, `Metas`.

### 3. `Board` becomes the router
```tsx
<div className={styles.board}>
  <TabBar tabs={tabs} onSelect={onSelect} />
  {tab === "geral" ? <GeneralTab data={data} /> : null}
  {/* task 05 adds ProjectionTab and GoalsTab here */}
</div>
```
`gap: var(--space-6)` between the bar and the panel. `Board/hook.ts` builds the
`tabs` array; nothing else.

Check `list-cards.helper.ts` and its test before you finish — it decides which
dashboard cards render for a payload. If it enumerates card keys that are now
split across tabs, update it and its test together; if it is purely about
empty-state gating, it may not need touching at all.

### 4. `HeroCard`
Props: `{ data }` (the `status: "ok"` payload). `hook.ts` is **pure — it calls
no React hook** — so it is directly testable and gets `hook.test.ts`.
`.squad/learnings.md` records this exact waiver ("can't be tested without
jsdom") being claimed falsely three times; the limit blocks *rendering*, not a
hook that happens to use no React.

What it returns, all from `data.points` and `data.range`:

| field | value |
|---|---|
| `endLabel` | `formatYyyymm(range.end)` — the eyebrow reads `SALDO PROJETADO · ${endLabel}` |
| `value` | `formatMoney(last.cumulative)` where `last` is the final point |
| `now` | `formatMoney(current.cumulative)`, `current` = the point whose `month === range.current` |
| `delta` | `formatMoney(last.cumulative - current.cumulative)` |
| `deltaUp` | `last.cumulative >= current.cumulative` — drives `▲` / `▼` **and** the badge tone |
| `facts` | three `{ key, label, value, sub }` (below) |

The three facts, matching the design:
- `ENTRADAS ${points.length}M` · `formatMoneyShort(sum of income)` · `média ${formatMoneyShort(mean)}/mês`
- `SAÍDAS ${points.length}M` · same shape over `expense`
- `MESES NO VERMELHO` · the count of points with `cumulative < 0`, and as the
  sub-line: `todos antes de ${formatYyyymm(monthAfterTheLastNegative)}` when
  every negative month precedes every non-negative one, otherwise
  `espalhados pelo período`, and when the count is zero the value is `0` with
  the sub `nenhum mês no vermelho`. Do not print "todos antes de X" without
  checking the run is actually contiguous — the design's sample data happened
  to be, real data will not always be.

Guard the empty case: `points` is never empty for `status: "ok"` (the range
always yields at least one month), but `current` **can** be missing if the
payload and the clock disagree. Fall back to the first point rather than
letting `undefined.cumulative` throw, and cover it in the test.

`hook.test.ts`: a rising series, a falling one (`deltaUp === false`), a series
with a contiguous negative prefix, one with scattered negatives, one with
none, and the missing-`current` fallback.

`index.tsx` structure and styling:
```tsx
<section className={styles.hero}>
  <div className={styles.scan} aria-hidden />
  <div className={styles.inner}>
    <div className={styles.headline}>
      <div className={styles.rule} aria-hidden />
      <p className={styles.eyebrow}>SALDO PROJETADO · {endLabel}</p>
      <p className={styles.value}>{value}</p>
      <div className={styles.deltaRow}>
        <span className={`${styles.badge} ${deltaUp ? styles.up : styles.down}`}>
          <span aria-hidden>{deltaUp ? "▲" : "▼"}</span> {delta}
        </span>
        <span className={styles.vs}>vs. saldo atual de {now}</span>
      </div>
    </div>
    <dl className={styles.facts}>…</dl>
  </div>
</section>
```
```scss
.hero {
  position: relative; overflow: hidden;
  padding: var(--space-6);
  background: var(--color-text);      // inverted: near-black in light,
  color: var(--color-bg);             // near-white in dark
  border: var(--border-2) solid var(--color-border);
  border-radius: var(--radius-md);
}
.scan {
  position: absolute; inset: 0; pointer-events: none;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0 3px,
    color-mix(in srgb, var(--color-bg) 5%, transparent) 3px 4px
  );
}
.rule { width: 64px; height: 6px; background: var(--gradient-toxic); border-radius: var(--radius-sm); }
```
The design writes the scanline as `rgba(255,255,255,.045)`, which is a
hardcoded colour and breaks rule 1. `color-mix` over `--color-bg` is the same
effect, flips with the theme, and the repo already uses `color-mix` in
`Modal`'s `::backdrop`.

The badge is `--color-positive` / `--color-negative` fill with `--ink-900`
text — and it pairs the colour with a `▲`/`▼` glyph, which rule 7(c) requires
and which is why `deltaUp` exists rather than reading the sign at render time.

**Contrast check, not assumption:** the hero inverts the surface, so `--ink-900`
text on `--color-positive` and the muted `opacity`-based sub-lines are new
pairings. `.squad/learnings.md` (2026-07-25) records that the light theme's
`--color-positive` already fails the contrast floor on normal surfaces and that
the owner deliberately deferred fixing the palette — so **do not** special-case
a colour here to dodge it, and **do not** write "legible in both themes" into
the PR body. Measure and report the numbers, or say nothing.

### 5. `spark.helper.ts` — the sparkline path
Pure, tested, no React:
```ts
export const SPARK_W = 112;
export const SPARK_H = 30;

// An SVG path pair for a 112×30 inline sparkline: the line itself and the
// same line closed to the baseline for the translucent fill underneath.
export function spark(values: number[]): { line: string; area: string } | null
```
The geometry, from the design: `min`/`max` over `values`; `span = (max - min) || 1`;
`dx = SPARK_W / Math.max(1, values.length - 1)`; point `k` is
`[k * dx, SPARK_H - 3 - ((v - min) / span) * (SPARK_H - 8)]`; the line is
`M`/`L` commands with one decimal; the area is the line plus
`L ${SPARK_W} ${SPARK_H} L 0 ${SPARK_H} Z`.

Return `null` for an empty array so the caller renders no `<svg>` at all — an
empty `d` attribute is a console warning in some browsers and an invisible bug
in others. A single value and an all-equal series must both produce a flat line
(that is what `|| 1` is for); test both, plus a two-point series, plus that
every coordinate lands inside the 112×30 box.

### 6. `StatCard`
Three changes. The first breaks an existing test **on purpose**:

**Rows.** Today: `Valor atual`, `Média`, `Desvio padrão`, `Mediana`. The design
labels them `Realizado`, `Média/mês`, `Mediana`, `Desvio padrão` — same four
numbers (`current`, `mean`, `median`, `stdDev`), better names, different order.
Adopt them, and update `hook.test.ts:57`, which asserts the whole `rows` array
with an exact `toEqual`. Keep the same `key` strings (`current`, `mean`,
`stdDev`, `median`) so nothing downstream shifts. Do **not** invent per-card row
sets (the design gives the Saldo card `Acumulado hoje` / `Melhor mês`); one row
shape for all three cards is less code and the numbers are already correct.

**Sparkline.** New prop `series: number[]`, rendered top-right of the title row:
```tsx
{spark ? (
  <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
       fill="none" preserveAspectRatio="none" aria-hidden className={styles.spark}>
    <path d={spark.area} fill={color} opacity="0.12" />
    <path d={spark.line} stroke={color} strokeWidth="2" fill="none" />
  </svg>
) : null}
```
`color` is a literal token string — `"var(--color-positive)"`,
`"var(--color-negative)"`, `"var(--color-brand)"` — passed as a presentation
attribute, exactly as `chart.config.ts` does and for the same reason: it
resolves inside SVG and follows the theme switch with no JS.
`aria-hidden` because the four rows below already carry every number the
sparkline shows.

`Board`/`GeneralTab` supplies the series: `points.map(p => p.income)` for
Entradas, `p.expense` for Saídas, and **`p.cumulative`** for Saldo — the design
draws the running balance there, not the per-month delta.

**Frame.** The design's corner marks:
```scss
.card { position: relative; }
.card::before,
.card::after {
  content: ""; position: absolute; width: 10px; height: 10px;
}
.card::before { top: calc(var(--border-2) * -1); left: calc(var(--border-2) * -1); background: var(--color-brand); }
.card::after  { bottom: calc(var(--border-2) * -1); right: calc(var(--border-2) * -1); background: var(--color-border); }
```
These sit on the `SectionCard` wrapper `StatCard` already renders, so add the
class from `StatCard`, not by editing `SectionCard` (task 03 owns that file and
13 other call sites do not want corner marks).

Also add the caption `VALOR TOTAL NO PERÍODO` under the headline —
`--text-2xs`, muted, `--tracking-wide` — and keep the `▲`/`▼` glyph on the
signed headline. `hook.test.ts:22,29,36` assert those glyphs; they must keep
passing untouched.

### 7. `GeneralTab` layout
```scss
.tab { display: flex; flex-direction: column; gap: var(--space-6); }
.kpis { display: grid; grid-template-columns: 1fr; gap: var(--space-6);
  @include t.bp("lg") { grid-template-columns: repeat(3, 1fr); } }
```
Charts stay full width, one per row, in their existing `ChartCard`. The design
stacks the KPIs into one column below 1240px; `lg` (1024px) is the closest
breakpoint in this repo's closed map — use it rather than adding a fifth.

**Do not change `ChartCard`'s height** (`calc(var(--space-24) * 2.75)`). It is
read back by `getBoundingClientRect` in `ChartCard/hook.ts` and is the sole
source of every chart scale. If task 03's `SectionCard` padding change moves
the measured box, the charts re-scale automatically — but
`chart-frame.helper.test.ts` asserts geometry derived from `CHAR_PX = 6`, tuned
to JetBrains Mono at `--text-2xs`. That test failing means a font or type-scale
token moved, which is out of scope for this story; investigate rather than
adjusting the constant.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npx vitest run --exclude '**/.claude/**' && npx tsc --noEmit && npm run build
```

Baselines: lint **2 errors + 1 info**, tsc **1 error**, test **45 files / 321
tests** plus whatever earlier tasks added — re-measure on the merged `main`.
Never run `npm run lint:fix`.

**Prove the new tests bite.** After `spark.helper.test.ts` and
`HeroCard/hook.test.ts` are green, mutate one line of each implementation
(flip a sign, drop the `|| 1`) and confirm the suite goes red before reverting.
`.squad/learnings.md` records a fix shipping with a green suite it could not
possibly fail.

### Browser check
Start the dev server from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. You need real data:
if the DB is empty the dashboard renders `no_range` and none of this shows —
set a range in Configurações and add a few movements and recurrences first.

- The three tabs render; clicking `Projeção` or `Metas` shows nothing yet
  (task 05) and **does not** fire a second `/api/dashboard` request — confirm
  with `read_network_requests`, not by eye.
- The hero card's projected value equals the last row of the accumulated-balance
  chart, and `vs. saldo atual` equals the value at the HOJE point. Cross-check
  one of them against the chart's own tooltip text.
- Each KPI card shows a sparkline whose shape matches its chart series
  (Entradas rises where the bar chart's green bars are tall).
- A **single-month range** does not crash the sparkline or the hero: set
  `rangeStart === rangeEnd` in Configurações and reload.
- Both themes. At 375px the KPI cards stack, the hero's facts wrap, and the
  page body does **not** scroll horizontally.
- No console error.

Two recorded traps: a `computer` click can report success while landing on
nothing — verify with `read_page`/`read_network_requests`; and state read in
the SAME `javascript_tool` call as the action that changed it reports the
PRE-change value.

### Anything else you touch
`DashboardScreen/hook.ts` gains tab state and nothing else — the fetch, its
`profile` key and its stale-response guard stay exactly as they are. No API
call changes. `MonthlyBarChart`, `BalanceLineChart`, `ChartFrame`,
`chart.config.ts` and `chart-frame.helper.ts` are **not** edited by this task;
if you find yourself opening one, stop and re-read the scope.
