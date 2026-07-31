# The goals become rows of one table

## Outcome
- Under the header strip: a column-header row (`META`, `DEDICADO`, `EM PARALELO`,
  `UM DE CADA VEZ`), then one row per goal — no per-goal card, no two-column grid.
- At >=1024px the four columns line up between the header row and every goal row, the
  three metric columns are right-aligned, and no per-row metric label is visible.
- Below 1024px the header row is not rendered and each goal keeps today's stacked
  shape: label left, value right, bar under the pair.
- `ritmo zero`, the three bar colours and the empty state are unchanged.

## Context
The design's whole responsive mechanism is four custom properties flipped in one media
query — `Dashboard v2.dc.html:31` and `:48`:
```
--goal-cols:minmax(180px,1.2fr) repeat(3,minmax(0,1fr));--goal-lab:none;
--goal-just:flex-end;--goal-head:grid;--goal-gap:var(--space-2);
@media (max-width:820px){--goal-cols:minmax(0,1fr);--goal-lab:block;
--goal-just:space-between;--goal-head:none;--goal-gap:var(--space-4)}
```
Owner decision: the threshold is `@include t.bp("lg")` (1024px), min-width, not the
design's 820 max-width. `$breakpoints` is Sass and compile-time
(`src/styles/_theme.scss:11-16`) — do not invent a fifth entry.

- **Imitate** `src/components/RowGrid/style.module.scss:31-41` for a row that is a
  grid with named cells, and `:58-77` for placing them by attribute rather than source
  order (`> [data-cell="who"] { grid-area: who; }`, gutters on the cells so an absent
  cell costs nothing). Its `<ul>`/`<li>` shape is the precedent to follow:
  `src/components/RowGrid/index.tsx:12` — `return <ul className={styles.list}>{children}</ul>;`
- **DOM contract for task 03** (an e2e handle must not be a hashed CSS-module class):
  each goal is an `<li>` inside one `<ul>`; the goal name sits in `[data-cell="name"]`,
  the target badge in `[data-cell="target"]`; the three metrics stay a `<dl>` of three
  `<dt>`/`<dd>` pairs in the order DEDICADO, EM PARALELO, UM DE CADA VEZ. Do not drop
  the `dt`/`dd` pairing — `e2e/goals-page.helper.ts:72-77` reads labels and values as
  paired lists, and `display: none` keeps `textContent` readable.
- **Reuse verbatim**, both already correct in `GoalCard/hook.ts`: the `METRICS` triple
  (`["dedicated","DEDICADO","var(--color-brand)"]`, `parallel`/`--color-accent`,
  `serialized`/`--color-caution`), `landing(pace: GoalPace): string`, and the bar
  guard at `hook.ts:59-65` — `pace === null || horizon <= 0 ? null : { color, width }`.
  `horizon` is `ceiling.months.length` (`SavingsSection/hook.ts:15`) and its zero guard
  is NOT covered by any test — keep it.
- **Reuse** the row hover precedent, the only one in the repo —
  `src/components/RowGrid/style.module.scss:42-46`:
  ```scss
  transition: background var(--duration-fast) var(--ease-snappy);
  &:hover { background: var(--color-surface-raised); }
  ```
- **Watch out for**: the last row's `border-bottom` must not double up with the card's
  own border. The design pulls the list up by one border —
  `Dashboard v2.dc.html:578`: `margin-bottom:calc(var(--border-1) * -1)`. Check on
  screen that a hover on the LAST row does not paint over the card's rounded bottom
  corners.
- **Watch out for** `e2e/row-overflow.spec.ts` (`/` at 375/767/768/1024/1440, asserts
  `documentElement.scrollWidth - clientWidth <= 0`). `SavingsSection/style.module.scss:8-13`
  names the exact trap: *"minmax(0, 1fr), never a bare 1fr: `1fr` is minmax(auto, 1fr),
  so the track never shrinks below a card's min-content width and the page scrolls
  sideways at 375px."* The design's own first track is `minmax(180px, 1.2fr)` — a hard
  floor. Verify it at 1024 rather than assuming.
- **Measure, do not assume**: the card is a full-width child of `.board` inside
  AppShell's `<main>` with the nav rail beside it, so the card is narrower than the
  viewport at 1024. Read its real inline size at 1024 before trusting the four columns
  fit (`javascript_tool` on the preview, per `.squad/learnings.md:21` — a backgrounded
  tab reports `innerWidth: 0`, and reading state in the same call as a change returns
  the pre-change value).
- **Watch out for** the 100-line cap (`sh scripts/check-line-cap.sh`).
  `GoalCard/style.module.scss` is at 100 lines today and `_bar.scss` already exists as
  the sanctioned split. `.squad/learnings.md:36`: lifting a rule into a partial strips
  its nesting and it silently loses specificity — re-nest under the same ancestor and
  prove it with `getComputedStyle` on the page.
- **Watch out for** `.squad/learnings.md:37`: Biome's `noRedundantRoles` /
  `useSemanticElements` pincer means a reflowing grid cannot declare table ARIA roles.
  Do not add `role="table"`/`role="row"`/`role="columnheader"` anywhere here.

## Scope
- In: `src/app/_components/DashboardScreen/components/GoalCard/**` (rename the folder
  to `GoalRow` — it is imported from exactly one place,
  `SavingsSection/index.tsx:4`), and `SavingsSection/{index.tsx,style.module.scss}`.
- Out: `e2e/**` (task 03). The banner/header strip from task 01 — do not re-open it.
  `src/app/api/dashboard/**` — no data shape changes; every figure already exists.

## Verify
- `npm run lint`
- `npx playwright test e2e/row-overflow.spec.ts` — must stay green.
- `npx playwright test e2e/goals.spec.ts` — expected RED until task 03; confirm the
  failure is the selector (`expected >= 2, received 0` from `readGoals`) and nothing
  else.
- On screen at 1440, 1024, 1023 and 375: the four columns align header-to-row above
  the threshold; below it the header row is gone and the labels are back.

## Forbidden
- No hardcoded colour, length, radius or duration — tokens only
  (`src/styles/README.md` rules 1 and 5, 4px scale; there is no `--space-7`/`--space-9`).
  The design's 6px bar and 11/12px stripe period are off-scale: `_bar.scss:10` already
  records `--space-1` as the nearest step, keep that reasoning.
- Do not add a visually-hidden metric label at >=1024px — the owner chose `display:none`
  (see the story's Owner decisions).
- Do not reach for a class name as an e2e handle, and do not remove the `data-cell`
  attributes named above.
- Do not change any wording, number, format or the goals' order.
