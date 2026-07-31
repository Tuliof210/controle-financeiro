# The savings banner in accent, and a bar per goal metric

## Outcome
- The "CAPACIDADE DE POUPANÇA" block is filled with the accent colour, striped,
  bordered and extruded like the other board cards, with the capacity figure and
  its caption on the left and OBJETIVOS / TOTAL EM METAS on the right. It reads
  correctly in both themes.
- Each goal card draws a bar under each of its three metrics — dedicado, em
  paralelo, um de cada vez — filled in proportion to how much of the remaining
  projection that metric's landing month consumes, and full when it lands beyond
  it. A metric with no pace ("ritmo zero") draws no bar.
- `e2e/goals.spec.ts` stays green: the banner is still a `<section>` whose heading
  is exactly `CAPACIDADE DE POUPANÇA`, the capacity is still its first `<p>`, a
  goal card is still the only `<section>` on the page carrying an `<h3>`, the
  target is still that `<h3>`'s immediate next sibling, and the three `<dt>`/`<dd>`
  pairs keep their labels and their order.

## Context
Design: `design.html` **536-566** (banner) and **568-603** (goal card).

**The accent fill does not flip, so its foreground cannot be a semantic token.**
`--color-accent` is lime in both themes (`--lime-400` light, `--lime-300` dark),
so `--color-text` on it would be near-white on lime in the dark theme. Pin the
foreground to the raw primitive and justify it the way
`src/components/EntryRow/style.module.scss:9-22` justifies its own: a comment
naming the measured ratio for the exact pair, in both themes. Contrast is a
property of the pair, never of the token.

**The stripes.** The design writes them as a raw ink at 5.5% alpha over the fill.
This repo already rejected that once, in the hero's scanline: *"a hardcoded colour
that breaks rule 1 and never flips with the theme. `color-mix` over `--color-bg`
is the same effect, theme-aware."* Use the same technique, and derive the stripe
period from the 4px scale rather than the design's 11/12px.

**Cap watch, before you write a line.** `SavingsSection/_banner.scss` is at
**exactly 100** and `SavingsSection/style.module.scss` is 36 — the banner has zero
headroom. `GoalCard/style.module.scss` is 85. The split mechanism is a `_*.scss`
holding one `@mixin`, `@use "./name" as *;` at the top and `@include name;` where
the rules belong in cascade order — `CeilingCard/_badges.scss` and its parent are
the exemplar. A partial that needs `t.bp` must `@use "theme" as t;` itself. Lifting
a rule out of a nesting strips it and it silently loses specificity — re-nest
under the same ancestor. Turbopack never sees a partial created while the dev
server runs: `touch` it.

**What the bars measure.** `GoalCardProps` is `{ goal: GoalProjection }` and
nothing more; each metric is a `GoalPace = { months, doneMonth } | null`, `null`
exactly when the saving pace is zero. The full-width reference is the number of
months left in the projection — `ceiling.months.length`, the same count the Teto
card prints as "N meses restantes" — so pass it down from `SavingsSection`, which
already receives the whole `BoardData`. Clamp at 100%: a goal landing past the
range is deliberately not clamped in the data (owner's decision) and the bar just
fills.

**Colours and weight for the bars**: `--color-brand` for dedicado,
`--color-accent` for em paralelo, `--color-caution` for um de cada vez, over
`--color-border-subtle`; the design draws 6px, which is not on the 4px scale, so
take the nearest token rather than a raw pixel. The bar restates the figure beside
it, so it needs no accessible name — but it must not be a `<dt>` or a `<dd>`, or
`readGoals`' paired read breaks.

`GoalCard` is a plain `<section>`, not a `SectionCard` — it duplicates the
border/padding/radius recipe locally, so the hard offset shadow task 01 added has
to be repeated here rather than inherited. Same for the banner.

Grids use `minmax(0, 1fr)`, never a bare `1fr`.

## Scope
- In: `components/SavingsSection/**` (including a new partial if the cap forces
  one), `components/GoalCard/**`.
- Out: `src/components/SectionCard/**`, `hints.ts`, `Board/`, the payload and
  every helper under `src/app/api/` — `pace`, the capacity caption and the three
  goal projections are all computed already. Also out: `e2e/`.

## Verify
- `npm run lint`; `wc -l` every touched file, `.scss` included — name the line
  count of each stylesheet in your report.
- `npm run build`; `npm test` — stop any `npm run dev` first, Next 16 locks per
  directory so a server on :3000 blocks Playwright's own on :3100. `goals.spec.ts`
  is the spec that reads this block.
- Browser preview, both themes, at 375, 768 and 1440: read the banner's text on
  the accent fill and report the measured contrast ratio for that pair in each
  theme; confirm the stripes are visible but do not fight the text.
- Confirm the three bars on a goal card differ from each other and that the
  longest metric has the longest bar.
- Seed or find a state where a goal's pace is zero and confirm no bar renders.
- Tab through the block and confirm every focus ring is visible on the fill.

## Forbidden
- No raw alpha colour and no hardcoded hex — `color-mix` over a token instead.
- No new `<dt>`/`<dd>`, no reordering of the three metrics, no rewording of
  DEDICADO / EM PARALELO / UM DE CADA VEZ or of the banner heading.
- Do not move the capacity figure out of the banner's first `<p>`.
- Do not add an `<h3>` outside a goal card, anywhere on this page.
