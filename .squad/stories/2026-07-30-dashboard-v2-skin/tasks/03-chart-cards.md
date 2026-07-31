# The two chart cards: ink bands, legends, and two new marks

## Outcome
- "Evolução mensal" and "Saldo acumulado" each wear an inverted-ink header band
  (task 01's prop) with a legend at its far end — two colour swatches labelled
  ENTRADAS / SAÍDAS on the bars, the sentence SÓLIDA = REALIZADO · TRACEJADA =
  PROJEÇÃO on the line.
- Behind the monthly bars, a shaded band starts at the first projected month and
  runs to the plot's right edge, tagged PROJETADO, with a dashed vertical rule on
  its leading edge. Bars, gridlines and axis all stay legible over it.
- The cumulative line marks the month the Teto card calls its bottleneck with a
  dashed vertical drop to the axis and a filled MÊS MAIS APERTADO label. No
  bottleneck, no mark.

## Context
Design: `design.html` **331-389** (bars) and **391-448** (line). The projected
band is lines 351-353, its dashed split 363; the legend 343-346 and 403; the
tightest-month annotation 417-421.

**The band and the legend need no new API.** `ChartCard` (18 lines) renders a
`SectionCard`, which already has `headerEnd?: ReactNode` pushed to the far end of
the title row by `.headerEnd { margin-left: auto }`. The legend goes there. The
header fill is task 01's prop, at its inverted-ink value.

**Where a background mark goes.** Both charts render their marks as children of
`ChartFrame`, which places them here:
```tsx
<Group top={MARGIN.top}>
  {gridValues.map(...)}   {/* gridlines */}
  {children}              {/* the marks */}
  <AxisBottom top={innerHeight} ... />
</Group>
```
SVG has no z-index, so a band painted after `{children}` covers the bars. Add an
optional `background?: ReactNode` to `ChartFrameProps` and render it as the
**first** child of that `<Group>`, before the gridlines. `ChartFrame/index.tsx`
is 87 lines and `chart-frame.helper.ts` is at exactly 100 — put the geometry in
the chart components, not the helper.

**The x coordinate.** `frame.monthScale(month)` is the band start,
`+ frame.monthScale.bandwidth() / 2` its centre (where `BalanceLineChart` puts
its dots). Full column height is `frame.innerHeight` — `MonthlyBarChart`'s
invisible hit rects already use it.

**Where "first projected month" comes from.** `dashedFrom` on the payload:
*"First month with `incomeEstimated || expenseEstimated`; NOT clamped to the
current month"* — so the band can legitimately start in the past, and that is the
intent, not a bug. `Overview/index.tsx` passes it to `BalanceLineChart` today and
**not** to `MonthlyBarChart`, which reads per-point `incomeEstimated` /
`expenseEstimated` instead. Thread it. `dashedFrom === null` means no band.

**Where the bottleneck month comes from.** Not from the line's own minimum —
`Ceiling.tightest: number | null` is the month the Teto badge already names
(`"Limitado por <mês>"`), and it is the suffix minimum of `ceilingBalance`, which
is not the same series as `cumulative`. Two marks naming two different months on
one screen is the failure to avoid, so pass `data.ceiling.tightest` down from
`Overview` and mark that month. `null` (which also means `monthly === 0`) draws
nothing. Note the mark then sits at a month, not at the curve's minimum, so
anchor the drop line to that month's own `cumulative`.

**Both marks live in the scrolling `<svg className={styles.plot}>`**, not the
pinned axis one, so their labels scroll with the plot — that is correct and
matches the design. The plot windows to 6 months below a measured 768px **plot**
width (`chart.config.ts`, `isDesktopWidth`), so a mark can start off-window; it
must not stretch `innerWidth`.

**Colours.** The band is `--color-surface-raised`, its tag and the label take
`--color-text-muted` and `--color-caution`. Contrast is a property of the pair —
measure each label's text against its own fill in both themes; do not infer it
from the fill's hue. Chart colours are already centralised as string constants in
`chart.config.ts` (`GRID_COLOR`, `TICK_LABEL_PROPS`, `axisProps`) — new ones go
there too, as `var(--token)` strings, never literals.

Every mark that carries information needs an accessible channel: the existing
bars and dots each carry an `aria-label` / `<title>`, and `ChartFrame`'s
`<section tabIndex={0} aria-label>` is the WAI-ARIA scrollable-region pattern —
do not downgrade that `<section>` to a `<div>`.

## Scope
- In: `components/ChartCard/**`, `components/ChartFrame/**`,
  `components/MonthlyBarChart/**`, `components/BalanceLineChart/**`,
  `chart.config.ts`, `components/Overview/index.tsx` + `hook.ts`.
- Out: `chart-frame.helper.ts` (at the cap), `ChartTooltip/**` (the hover bubble
  stays exactly as it is — the design's in-SVG tooltip card is not in this story),
  `hints.ts`, the payload and every helper under `src/app/api/`.

## Verify
- `npm run lint`; `wc -l` every touched file.
- `npm run build`; `npm test` — stop any `npm run dev` first, Next 16 locks per
  directory so a server on :3000 blocks Playwright's own on :3100.
- Browser preview, both themes, at 375 (6-month window) and 1440 (12-month): the
  band starts on the correct month, the bars read over it, the dashed rule lands
  on the band's leading edge, and the tightest-month label does not overflow the
  plot at either end.
- Confirm on screen that the month the line marks is the month the Teto card's
  "Limitado por …" badge names.
- Hover a bar and a dot and confirm the tooltip still appears with its text.
- Scroll the plot horizontally and confirm the pinned Y axis stays put.

## Forbidden
- No new tooltip mechanism, no in-SVG tooltip card.
- No hardcoded colour, no literal hex, no raw px font-size in an SVG attribute
  where a token exists.
- Do not compute the bottleneck month on the client from `points`.
- Do not change `chart-frame.helper.ts`, `MARGIN`, `Y_TICKS`, `BAND_PADDING`, or
  the 768px desktop threshold.
