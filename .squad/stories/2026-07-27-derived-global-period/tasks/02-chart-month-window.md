# Window the home charts to 12 / 6 months

## Outcome
- Each of the two home charts draws 12 month bands at a time on desktop and 6 on
  mobile, anchored at the oldest month; the remaining months are reachable by
  horizontal scroll inside the card, by pointer and by keyboard.
- The Y axis and its labels stay on screen while the plot scrolls.
- On mobile the Y tick labels express thousands as "K", one decimal, dropped
  when it is zero; desktop keeps today's format.
- The page itself still never scrolls sideways at 375px.

## Independently shippable
yes

## Scope
- In: `src/app/_components/DashboardScreen/` — `chart.config.ts`,
  `chart-frame.helper.ts`, `ChartCard/`, `ChartFrame/`, `MonthlyBarChart/`,
  `BalanceLineChart/` — and `src/lib/money.ts` for the new tick format.
- Out: `src/app/api/dashboard/**` — every month still ships in the payload; the
  window is a rendering concern. `spark.helper.ts` and `StatCard` share no code
  with this frame. The two cards scroll independently — the owner ruled out
  syncing them.
- Imitate: `src/app/leitor-ofx/.../ReportView/style.module.scss` — the repo's
  only horizontal-scroll pattern, including how it justifies a raw px floor
  against the no-hardcoded-spacing rule.
- Reuse: the `{width,height}` `ChartCard` already measures — it is the only
  responsive signal in this codebase. Do not introduce `matchMedia`, a
  `useMediaQuery`, or a second source of truth for the breakpoint.

## When to run
- Depends on: none
- Parallel-safe with: 01, 03

## Verify
- `npm run lint`, `npm run test`, `npm run build`
- `npx vitest run src/app/_components/DashboardScreen/chart-frame.helper.test.ts`
  — it asserts both charts resolve the same left edge and `innerWidth`. Decide
  there whether that invariant survives a pinned axis, and re-state it if not.
- Measure at execution time, never assume: the plot width `ChartCard` reports at
  a 375px and at a 1280px viewport, and which entry of `$breakpoints` in
  `src/styles/_theme.scss` that puts the 12/6 threshold on.
- With ~30 months of data, scroll each card to its far end at both widths and
  confirm the Y labels are still visible and the page has no sideways scroll.

## Forbidden
- No `overflow: hidden` on `SectionCard`, and nothing that relies on
  `outline-offset` for its focus ring inside the scroll box — an overflow
  ancestor clips it (see the comments in `SectionCard`/`TabBar` styles).
- The measured node must stay the clipping box: `useChartCard` re-measures after
  every render, so a width fed back from the SVG will never settle.
- Do not drop the per-mark `<title>`s, the `estimated` opacity encoding, or the
  dashed projection split.
