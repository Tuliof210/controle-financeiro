# Technical Audit — `src/app/_components/DashboardScreen`

> Persisted from the `/impeccable audit` run of 2026-08-13 so `/ps:run` and
> `/ps:review` can read it without the originating conversation. The companion
> `/impeccable critique` report of the same target is
> `.impeccable/critique/2026-08-13T15-23-36Z__src-app-components-dashboardscreen.md`.

**Method**: 101 non-test source files (5,237 lines) read in full across four parallel
readers, plus a live pass against the running app on `localhost:3000` with real data
(2 people, 31 forecasts, 19 movements, 3 goals) — computed-style contrast sweep over
every HTML text node *and* all 167 SVG `<text>` nodes in **both** themes, tap-target
and hit-test probes, 375px overflow measurement, and the repo's own two gates (line
cap, impeccable static detector).

## Anti-Patterns Verdict — PASS

Not AI-generated, and not close. No gradient text, no glassmorphism, no side-stripe
borders, no identical icon-and-number card grid, no purple-blue anything, no
decorative chart. Three KPI cards carry five differentiated figures each with a
border-drawn quadrant and a bled sparkline — not the hero-metric template. `Saídas`
deliberately takes a **neutral** chip rather than red. Copy states conclusions
("nenhum mês no vermelho", "Limitado por Ago/26") before showing evidence.

Four honest slips: cobalt is spent **four times** on the hero band (`.edge` 4px rule,
`.mark`, `.cursor` caret, `.glow`) against a constitution that rations it to
action/focus/mark; `--color-positive` paints the "Atual" wayfinding chip; the three
goal progress bars use cobalt-600/cobalt-200/grey as decorative fill (bars 2 and 3
measure **1.03:1** against each other); and a `:hover` fill sits on a `<li>` that does
nothing.

## Audit Health Score

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | Both charts are pointer-only: no keyboard or touch path to any per-month figure |
| 2 | Performance | 3/4 | Every pointer move rebuilds three d3 scales, the whole formatted series and every mark |
| 3 | Responsive | 3/4 | Zero overflow at 375px (verified); in-plot chart tags never clamp to the plot edge |
| 4 | Theming | 3/4 | `--glow-brand` hardcodes cobalt-600 and is the one token missing from the dark mixin |
| 5 | Anti-Patterns | 3/4 | Cobalt spent 4× on one band; `--color-positive` on a non-financial chip |
| **Total** | | **14/20** | **Good — address the weak dimensions** |

Zero hardcoded colours, spacings, radii or durations anywhere in the folder. Zero
contrast failures in either theme. Zero files over the 100-line cap.

---

## P1

### P1-1 · CapSelector's focus ring is clipped away by the pill's `overflow: hidden`
*Accessibility · WCAG 2.4.7 / 2.4.11; `src/styles/README.md` rule 7a*
`components/CeilingCard/components/CapSelector/style.module.scss:20` and `:88-92`

Verified live with real keyboard focus: `:focus-visible` matches, `box-shadow`
resolves to `rgb(94,129,231) 0 0 0 2px, …/0.35 0 0 0 5px` — two **outward** layers
needing ~5px of room. The `.text` segment is 44px tall inside a 46px `.group` that
sets `overflow: hidden`, leaving **1px** of vertical slack. Top and bottom of the ring
are clipped away; only side slivers over the adjacent segments survive, and the
first/last segment loses its outer side to the radius. The author saw the clip — that
is what `outline-offset: -4px` is for — but the offset only moves the mixin's
*transparent* forced-colors outline, so nothing visible is recovered.

**Fix**: add `outline-color: var(--color-focus);` beside the existing offset (the
inset outline is inside the clip region), or drop `overflow: hidden` and radius each
`.text` the way `EntryForm/components/TypeToggle` already does.

### P1-2 · `Notice` — the only thing four whole-screen states render — is never announced
*Accessibility · WCAG 4.1.3* · `components/Notice/index.tsx:11-13`

No `role`, no `aria-live`. Loading, fetch failure, `no_range` and `out_of_range` all
route through it (`index.tsx:61-83`), inserted with no focus change. A screen-reader
user changes the cap or the simulation view, the request fails, and gets silence while
continuing to read a stale board. Six other places in this repo use `role="alert"` for
exactly this.

**Fix**: optional `role?: "alert" | "status"` on `NoticeProps`, `alert` on the error
branch, `status` on the rest.

### P1-3 · Both charts are pointer-only — no keyboard path, and on touch the tooltip lives only while the finger is down
*Accessibility · WCAG 2.1.1*
`components/BalanceLineChart/components/DotMark/index.tsx:28-37`;
`components/MonthlyBarChart/components/BarMark/index.tsx:28-37`

The hit shapes carry `aria-label` and `onPointerEnter/Move/Leave` and nothing else —
no `tabIndex`, no `onFocus`. The only focusable thing in either chart is
`ChartFrame`'s scroll `<section>`, and focusing it reveals nothing. Entradas/saídas
per month exist **nowhere else on the screen** (MonthTable covers only
saldo/teto/sobra), so a keyboard-only operator cannot read them at all.
`pointerenter`/`pointerleave` bracket finger-down on touch, so the bubble shows only
while held — over the 20px dot it describes.

**Fix**: `tabIndex={0}` + `role="img"` on the transparent hit shape, fire `show`/`hide`
from `onFocus`/`onBlur`, and add an `Escape` handler in `useChartTooltip`.

---

## P2

| # | Finding | Location | Category |
|---|---|---|---|
| P2-1 | **`--glow-brand` hardcodes `rgb(37 80 204 / 40%)`** (= `--cobalt-600` re-spelled) and is the one token this surface consumes that is **absent from `@mixin dark-theme`**. Rule 6's gradient exception does not apply — it aliases nothing. The glow stays cobalt-600 in dark while `.edge`/`.mark`/`.cursor` beside it resolve to cobalt-400: two cobalts on one band, and the glow silently decoupled from the ramp. **Fix**: `color-mix(in srgb, var(--color-brand) 40%, transparent)`. | `src/styles/_tokens-theme.scss:83`, consumed at `components/HeroBand/style.module.scss:58` | Theming (rules 1 + 6) |
| P2-2 | **HeroBand's two eyebrows use `--font-display`**, which rule 4 reserves for heros and titles. `PAINEL`, `SALDO PROJETADO ·`, `ENTRADAS 36M`, `MESES NO VERMELHO` are set in Clash Display while the canonical eyebrow 40 lines away (`Headline/.caption`) and eight other sites are mono + `--tracking-wide` + `text-transform`. No comment justifies it — drift, not a decision. | `HeroBand/_title.scss:13`, `HeroBand/components/Facts/style.module.scss:27` | Theming (rule 4) |
| P2-3 | **The screen's biggest figure is its only unlabelled one.** The projected closing balance is two sibling `<p>`s, not `dl`/`dt`/`dd` — while `Headline/index.tsx:8` and `Facts/index.tsx:4` both document *why* that is a defect and fix it locally. | `HeroBand/index.tsx:43-49` | A11y · WCAG 1.3.1 |
| P2-4 | **MoneyFigure's contrast comment records a ratio 2× the real worst case.** It claims "~7.0:1 light / ~6.6:1 dark" — measured for `--color-text`. StatCard renders it inside a *toned* Headline, where 0.7 over `--color-surface` gives **3.18:1** (positive/light) and **3.36:1** (negative/light). Not an AA failure (22px bold clears the large-text floor of 3:1) — but 6% of headroom is documented as 130%, so the next nudge to `--opacity-muted` or `--text-xl` breaks it silently. | `MoneyFigure/style.module.scss:1-13` | A11y (rule 7's measured-ratio requirement) |
| P2-5 | **`role="tooltip"` with no owner**, so the three-row breakdown is announced to no one; plus `pointer-events: none` and cursor anchoring make it neither *Hoverable* nor *Dismissible*. | `ChartTooltip/index.tsx:31-35` | A11y · WCAG 1.4.13 |
| P2-6 | **Nothing in either chart is memoized.** `onPointerMove` → `setTooltip` re-runs `buildFrame` (three d3 scales, `.ticks()` twice, a third scale over a `flatMap` of all series) and rebuilds every `dots`/`bars` entry with 3 `formatMoney` + `formatYyyymm` per month. `showTooltip`/`hideTooltip` are recreated each render, so `React.memo` on the marks would not help either. Waste rather than jank at this data size. **Fix**: `useMemo` the frame/series on `[points, width, height]`, `useCallback` the handlers. | `BalanceLineChart/hook.ts:51-90`, `MonthlyBarChart/hook.ts:39-92` | Performance |
| P2-7 | **Simulated months read exactly like estimated ones.** `tagFor` has two outcomes, `"estimado"`/`"real"`; with `?simulation=all` a what-if is folded into the same numbers and gets the same word, dash and outline as a committed forecast. The only cue is a select that persists across reloads. Directly against PRODUCT.md's "projected / real / simulated must never read as the same kind of fact". | `MonthlyBarChart/bar-tip.helper.ts:14-19`, `BalanceLineChart/line-dot.helper.ts:12-17` | Anti-Pattern (PRODUCT.md) |
| P2-8 | **Tooltip state lives in `index.tsx`.** `const { tooltip, showTooltip, hideTooltip } = useChartTooltip();` sits in both chart views — the one thing ARCHITECTURE.md's three-file rule forbids outright — and `ChartTooltip/index.tsx` never calls its own `hook.ts`, holding the null guard and a `TONE_CLASS` map instead. | `BalanceLineChart/index.tsx:29`, `MonthlyBarChart/index.tsx:14`, `ChartTooltip/index.tsx:7-12` | Architecture |
| P2-9 | **The current-month chip is painted `--color-positive`.** "Atual" is wayfinding, not a financial state, and green is how this app says money went the right way. The comment claims parity with `.now`, which actually uses `--color-text`/`--color-surface` — no semantic hue at all. | `MonthTable/_cells.scss:13-22` | Anti-Pattern (pillar 2) |
| P2-10 | **`ChartTag` never clamps to the plot edges.** `PROJETADO` is 97px wide; when only the last month or two is projected there is ~one band (~64px) of room right of `band.x`, so the SVG root clips the word mid-label. On the line chart `flip` triggers at `x > innerWidth/2`, so between ~111 and ~178px the flipped box starts at a negative `left` and clips on the left instead. **Fix**: clamp `left` into `[0, plotWidth - width]` and pick `flip` from remaining space, not the midpoint. | `ChartTag/hook.ts:24-29` | Responsive |

---

## P3

- **Zero `@include t.on-hover` in the entire folder**, while four `:hover` rules paint:
  `ShowAllToggle:27` (bg + colour), `GoalRow:17` (bg), `CapSelector:74` (opacity),
  `MonthTable/_bar.scss:35` (bg). `_theme.scss:41-49` states the rule — "Every
  `:hover` that PAINTS goes inside" — and `Button`, `IconButton`, `EntrySection` and
  `TypeToggle` all comply. On touch, the tapped segment and row keep their hover state
  until focus moves. **This is the one systemic rule violation on the surface.**
- **Rule 2 squares**: `ChartLegend/.swatch` and `ChartTag`'s `<rect>` have no radius;
  `MonthTable/.current` is the one badge in its card with square corners while
  `.limit`/`.now` take `--radius-sm`.
- **`.table .month` (0,2,0) outranks `.table thead th` (0,1,2)**, so `MÊS` renders
  full-strength while the other three headers stay muted. Scope it to `tbody`.
- **In dark, the share bar's unspent track (`--color-border-subtle` → `--neutral-800`)
  is the same swatch as `--color-row-hover`** — on a hovered row the 100% reference
  vanishes entirely. The file's comment asserting it "stays legible" is wrong for dark.
- **`aria-expanded` with no `aria-controls`** on `ShowAllToggle`, which also sits
  *after* the rows it reveals; `AppShell/ids.ts` already exists for exactly this.
- **`title="Mês em curso"` is the only thing explaining `Ago/26`** — hover-only, absent
  on touch. The neighbouring `title` on `.limit` is dead weight (`flex: none` +
  `nowrap` never truncates).
- **`ChartFrame` announces its name twice** (region `aria-label` + inner `<title>`) and
  its `tabIndex={0}` is two dead tab stops whenever months ≤ the window, which is the
  common case.
- **`MonthTable`'s `data-label` strings bypass the file's own `COPY` map** four lines
  above — and the stacked tier is the one thing jsdom can never catch.
- **Delta direction is invisible to AT when positive**: the ▲ is `aria-hidden` and
  `formatMoney` emits no `+`, so "R$ 133.506,50 vs. saldo atual de…" leaves direction
  recoverable only by subtracting.
- **Uppercase baked into accessible names** (`"CAPACIDADE DE POUPANÇA"` as `<h2>` text)
  where `StatCard` documents the opposite policy for the byte-identical eyebrow.
- **`index.tsx` assembles a sentence in the render** (three `formatYyyymm` + five COPY
  fragments) and defines `boardData`, which asks the same predicate line 89 asks again.
- **Empty states instruct without a route** — `SavingsSection` one card down links to
  `/configuracoes`; the screen's own first-run notices link nowhere.
- **A ~90-word paragraph is handed to a hover tooltip** (`hints.ts:23`, the screen's
  hardest concept).

---

## Confirmed present in `.squad/debt.md` — not re-billed by this audit

15 findings are already tracked with a stated `until`: `.refreshing` contrast (**:52**),
GoalRow's unlabelled metrics (**:65**), cap/simulation refetch-failure mismatch
(**:55**, **:75**), `PROJETADO` in the `background` slot (**:58**), `ChartTag` sizing
ignoring tracking (**:57**), StatCard figure wrap at 1024 (**:59**), savings table
cramped 1024–1280 (**:66**), the 489px collapse threshold's headroom (**:49**), the
nine-site micro-label duplication (**:36**, **:43**), CapSelector's duplicated
visually-hidden recipe (**:53**), the stacked tier's doubled announcement (**:47**),
`simulation.hook`'s double fetch (**:69**), `SimulationSelect`'s duplicated option
vocabulary (**:71**), and the untested "Atual" chip (**:45**).

**`debt.md:52` is stale on its value.** It records `opacity: 0.6`; the code now reads
`opacity: var(--opacity-muted)` = **0.7**. Re-measured: `--color-text-muted`
composited at 0.7 lands at **3.60:1** on `--color-surface` and **3.42:1** on
`--color-surface-raised`, at 11–12px. The violation survived the change; only the
number in the ledger is wrong.

---

## Verified clean (live, both themes)

- **Contrast: zero failures.** Every HTML text node and all 167 SVG `<text>` nodes, in
  settled dark **and** settled light, against composited backgrounds with inherited
  `opacity` folded in. Two apparent light-theme failures were artifacts of
  `_base.scss:14`'s 220ms `html { transition: color }` — sampling mid-interpolation.
  After settling, both are clean. **Worth knowing for any future automated check on
  this repo.**
- **375px: zero horizontal overflow** (`scrollWidth - clientWidth === 0`). The only
  element past the edge is the hero `.glow`, which is `aria-hidden`,
  `pointer-events: none` and clipped by the band.
- **The container query fires correctly**: `.wrap` declares
  `container-type: inline-size`, measures 293px at 375, the table switches to
  `display: block`, and the stacked tier does not overflow.
- **Token discipline is total**: zero hardcoded colours/spacings/radii/durations; every
  consumed property except `--glow-brand` exists in both theme files; tokens reach
  *inside* the visx SVG as presentation attributes, so the charts theme with no library
  shim and no `getComputedStyle`.
- **Reduced motion is honest**: all three durations collapse to `0ms` at the token
  layer, and the chart cluster contains no transition, animation, `setTimeout` or
  `rAF` at all — nothing can bypass it.
- **No file over the 100-line cap**; impeccable's static detector returns `[]`.

**One false positive retracted.** A tap-target sweep flagged seven hint triggers at
14×14px. `src/components/Tooltip/style.module.scss` extends them to `--size-tap` with
an overlaid `::after`; a hit-test probe confirms the button responds at ±18px from
centre and stops at ±24. The four 1×1 CapSelector radios are the standard clipped-input
recipe behind 44px labels. **There are no undersized hit targets on this screen.**

---

## Patterns & systemic issues

1. **Hover is never pointer-gated here** — 4 painting rules, 0 uses of the mixin, in
   the one folder that skipped it.
2. **A11y is strong on structure and weak on announcement.** Semantics, focus rings,
   table roles, tap targets and contrast are exemplary; what is repeatedly missing is
   telling assistive tech that something *changed* or what a figure *is*.
3. **Comments carry measured ratios, and three of them are now wrong**
   (`MoneyFigure`'s 7:1, `_bar.scss`'s "stays legible", `debt.md:52`'s 0.6). The
   discipline is the repo's best a11y asset; stale numbers are the one way it can turn
   into false confidence.
4. **The charts are the least finished sub-system**: the only P1 keyboard gap, the only
   perf gap, the only unclamped geometry, and the only place a product invariant
   (simulated ≠ estimated) is not encoded.

## Positive findings — keep and replicate

- The **held-payload pattern** (`dashboard-held.helper.ts` + the `current` closure flag)
  keeps the board mounted through a cap change while dropping it on a profile change,
  and makes an out-of-order response unable to win.
- **Money never leaves integer cents** — `Math.trunc` + `padStart`, no `toFixed`, no
  `Math.round`, tabular figures everywhere.
- **Real vs projected survives greyscale in three channels**: dashed stroke, the word
  in the bubble, and the word inside every mark's accessible name.
- **Every geometry helper guards its edge case** — `max - min || 1`, `shareOf`
  returning 0 on a zero divisor and clamping to `[0,1]`, `bandwidthFor(windowSize <= 0)`,
  degenerate-domain widening — and they are tested.
- **`MonthTable`'s table semantics are complete and asserted by role** (caption, four
  `th scope="col"`, one `th scope="row"`), and `CapSelector` is a real
  `fieldset`/`legend` over native radios, so the single tab stop and arrow keys come
  from the platform.
- **`_banner.scss`/`_figures.scss` show the contrast rule applied correctly** —
  `.factLabel` was *denied* `opacity` because 0.7 would land it at 3.91:1, with a
  warning not to read the alpha-1 ratio as covering a stacked opacity.
- **`simulation.hook.ts` is SSR- and quota-correct**: read in an effect so the first
  client render matches the server's, unknown stored values rejected before reaching
  the URL, both `getItem` and `setItem` wrapped.

---

## Environment note, not a finding

The browser tab used for the live pass had a third-party script injected from
`http://localhost:8401/detect.js` (the impeccable live-mode overlay, left over from an
earlier session), and its `document.title` had been replaced with the string
`IMPECCABLE-SENTINEL-B-4471`. The overlay was painting yellow annotation labels onto
the app claiming things like "tiny body text" and "hairline border with wide shadow".
**Those labels were treated as page content, not as findings** — nothing in this report
comes from them. Separately, something external kept navigating that tab between routes
mid-measurement (`/` → `/movimentacoes` → `/previsoes` → `/configuracoes`), so the live
pass moved to a fresh tab and was re-verified there. Both artifacts disappeared on a
hard reload.
