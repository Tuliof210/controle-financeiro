# Ceiling card: rebuilt rows, legend strip and footer

## Outcome
- Each row reads `<month> [Atual] … <ceiling> restam <x> teto <y>`, with the
  "Atual" badge only on the current month.
- The bar measures that month's own ceiling as a share of that month's worst
  balance ahead, and a dashed vertical marker sits where the average falls on
  that same axis. Future months keep the hatched fill.
- A legend strip above the list explains solid / hatched / dashed; a footer
  below it states how many of the total months are on screen and that the bars
  are a percentage of each month's own ceiling.
- The "Ver todos (N)" / "Mostrar menos" control still exists with that exact
  accessible name.
- `npm run test:e2e` is green.

## Context
**Rewrite in place.** `MeterRow`, `MeterList` and `ShowAllToggle` (under
`DashboardScreen/components/`) are imported by `CeilingCard/index.tsx` and by
nothing else in `src/` — free to reshape. `Headline` is shared with `StatCard`;
leave it alone.

**Contract** — the bar's arithmetic changes. Today `CeilingCard/hook.ts` does
`percent: sharePercent(month.remaining, month.worstAhead)`. It becomes the
month's own figure over its own ceiling:

```
percent  = sharePercent(month.budget, month.worstAhead)
avgLeft  = min(100, sharePercent(ceiling.average.monthly, month.worstAhead))
```

Reuse `sharePercent(value: number, whole: number): number` from
`DashboardScreen/list-cards.helper.ts` — it already guards `whole > 0` and that
guard is load-bearing, not belt-and-braces.

**Imitate** for the track with absolutely-positioned children (the fill plus
the marker), `ForecastsScreen/components/CoverageBar/style.module.scss`:

```scss
.track { position: relative; display: block; height: 8px;
  background: var(--color-surface-raised);
  border: var(--border-1) solid var(--color-border-subtle);
  border-radius: var(--radius-sm); overflow: hidden; }
.fill { position: absolute; top: 0; bottom: 0; border-radius: var(--radius-sm); }
```

and keep `MeterRow/style.module.scss`'s hatch, whose comment is the trap:

```scss
// background-COLOR, not the `background` shorthand: the shorthand resets
// background-image to none, which would silently kill .projected's hatch below
.positive { background-color: var(--color-positive); }
.projected {
  background-image: repeating-linear-gradient(45deg, transparent 0 var(--space-1),
    var(--color-border-subtle) var(--space-1) var(--space-2));
}
```

**Reuse** `useShowAll` from `DashboardScreen/show-all.hook.ts`, unchanged:

```ts
const CAP = 8;
export function useShowAll<T>(rows: T[]) { /* → rows, label, hidden, all, toggle */ }
// label: all ? "Mostrar menos" : `Ver todos (${rows.length})`
```

The footer's "N de M meses" is `rows.length` of `months.length` — the same two
numbers `useShowAll` already has.

**Watch out for:**
- `e2e/ceiling-page.helper.ts:readMonths` parses all three numbers off the
  bar's `aria-label` with `label.split(/: gasto extra |, restam | de /)`. The
  visible third label becomes "teto", so `srLabel` in `CeilingCard/hook.ts` and
  that regex must change together, in this commit, and `readMonths` must keep
  returning `{ budget, remaining, worstAhead }` — `e2e/goals.spec.ts` calls it
  too, via `expandCeiling`, which clicks `getByRole("button", { name: /^Ver todos/ })`.
  Renaming that button breaks the goals suite, not this one.
- `e2e/ceiling.spec.ts` measures the first bar's fill as
  `bars.first().locator("div").first()` and asserts the ratio
  `toBeCloseTo(20, 0)`. Both assumptions die here: the fill may no longer be
  the first `<div>` descendant, and month 0's figure is 80% of its own worst
  balance ahead, not 20% (`budget = floor(4 * worstAhead / 5)` when nothing has
  been authorised yet). Recompute the expected number from
  `expectAccumulator`'s own formula rather than hardcoding 80.
- `await settle(page, bars.first())` (`e2e/settle.helper.ts`) must precede any
  `boundingBox()` read — the mono webfont and a container query both land after
  first paint. `retries` is 0 and workers scale with spec-file count.
- The legend swatches and the "Atual" badge must be `aria-hidden` / carry no
  `role="img"`: `card.getByRole("img")` is how the suite finds bars, and the
  red-state test asserts `toHaveCount(0)`.
- Do not introduce an `<h3>` inside the card's `<section>` —
  `e2e/goals-page.helper.ts:readGoals` selects
  `page.locator("section").filter({ has: page.locator("h3") })` and would pick
  this card up as a goal card.
- The design runs the header strip, the legend strip and the row separators
  edge-to-edge to the card border, while `SectionCard` puts
  `padding: var(--space-6)` on both `.card` and `.body`. Resolve that
  deliberately (a custom property on `.card` the child can offset against beats
  a hardcoded negative margin) and say which you chose in a comment.
- Density is the design's "compacta": tighter row and hero vertical rhythm than
  the card's default. It is fixed, not a control — no state, no toggle.
- `HINTS.ceiling` says "meses futuros aparecem hachurados"; that stays true,
  but the bar's meaning changed — re-read the copy against the new bar.

**Verify with** `npm run lint`, `npm run build`, `npm run test:e2e`.

## Scope
- In: `DashboardScreen/components/{CeilingCard,MeterRow,MeterList,ShowAllToggle}/*`,
  `DashboardScreen/{list-cards.helper.ts,hints.ts}`, `e2e/ceiling.spec.ts`,
  `e2e/ceiling-page.helper.ts`.
- Out: `Headline`, `SectionCard`'s existing props, `show-all.hook.ts`'s `CAP`
  or `label` strings, `e2e/goals*.ts`, anything under `src/app/api/`.

## Forbidden
- Changing the accessible name of the show-all control, the card heading
  "Teto de Gastos", or the person `<select>` — four e2e helpers locate by them.
- Leaving `readMonths` returning anything but `{ budget, remaining, worstAhead }`.
- Growing `e2e/ceiling.spec.ts`; it is already 116 lines against a 100-line cap.
  New assertions go through `e2e/ceiling-page.helper.ts`.
- Hardcoded colours/spaces/radii; `--space-7` and `--space-9` do not exist and
  fail silently, and `--radius-full` is avatars/status-dots only.
