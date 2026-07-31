# One card: the capacity banner becomes a header strip

## Outcome
- The savings block renders as a single bordered card — the accent banner is its
  header strip, flush to the card's inner edge, with a `--border-2` rule under it.
- The banner no longer carries its own `border-radius` or its own hard shadow; the
  card carries both, and the card's top corners are not clipped by the fill.
- The goal cards keep their current two-column grid, now inside that card.

## Context
The design (`Dashboard v2.dc.html:538-539`) puts `overflow:hidden` on the section and
lets the band square off against it. **This repo forbids that.**
`src/components/SectionCard/style.module.scss:3-5`:
> `// No overflow: hidden here, ever: the Tooltip trigger inside .titleRow uses`
> `// t.focus-ring, an outline with outline-offset — an overflow-hidden ancestor`
> `// clips it on all 13 cards at once, and nothing tests focus rings.`
This card has a Tooltip in its band too (`SavingsSection/index.tsx:23-26`), so the same
applies here.

- **Imitate** `src/components/SectionCard/_band.scss:8-19` — the whole technique,
  including why the radius is `sm`:
  ```scss
  // ...the top corners are rounded by hand: the card's --radius-md
  // outer radius minus its --border-2 border is exactly --radius-sm.
  .band {
    margin: calc(var(--space-6) * -1);
    margin-bottom: 0;
    padding: var(--space-3) var(--space-6);
    border-bottom: var(--border-2) solid var(--color-border);
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  }
  ```
  and `_band.scss:64-70` for where the extrusion goes once the fill is not the card:
  ```scss
  // README rule 3, as amended: a card carrying a filled band is the third scope
  // for the hard offset shadow.
  .extruded { @include t.elevation(press); }
  ```
- **Reuse** what is already right in `SavingsSection/_banner.scss:14-18` — the fill is
  `--color-accent` with the foreground pinned to the `--ink-900` primitive, measured
  13.40:1 (light) / 16.26:1 (dark) and 6.11:1 / 6.74:1 at the 0.7 opacity the muted
  lines take. `--color-accent` is lime in BOTH themes, so that pin must survive the
  move; do not swap it for a semantic token.
- **Watch out for** `Board/index.tsx:7-9` and `SavingsSection/index.tsx:12-14`, which
  both state in prose that SavingsSection returns a fragment because "Board owns the
  column". That stops being true here — update both comments, or they mislead the next
  reader. The `--space-6` between cards then comes from `.board`'s gap alone.
- **Watch out for** the 100-line cap (`sh scripts/check-line-cap.sh`, diffed against
  `main`). `SavingsSection/_banner.scss` is already 91 lines and
  `GoalCard/style.module.scss` is at 100. Splitting further is allowed only as a
  `_*.scss` mixin partial beside `style.module.scss` (ARCHITECTURE exception), and
  `.squad/learnings.md:36` warns that lifting a rule into a partial strips its nesting
  and it silently loses specificity — re-nest under the same ancestor.
- **Watch out for** `.squad/learnings.md:32`: Turbopack never sees a Sass partial
  created while the dev server runs — `touch` it.
- **Verify with** the commands in `## Verify`. `e2e/goals-page.helper.ts:25-27` finds
  the banner as *the* `<section>` containing the heading `CAPACIDADE DE POUPANÇA`;
  after this task the outer card is that section and the band is a `<div>` inside it,
  which still resolves to exactly one element. It must stay exactly one — a second
  nested `<section>` around this block is a Playwright strict-mode violation that kills
  all five goals tests at `openGoals`.
- **Watch out for** `readCapacity` (`e2e/goals-page.helper.ts:35`): it reads
  `banner.locator("p").first()` in DOCUMENT order. Once `banner` is the whole card,
  the capacity `<p>` must remain the first `<p>` in it — the empty-state `<p>`
  (`SavingsSection/index.tsx:50`) sits after the band, so this holds; do not introduce
  a lede paragraph above the band.

## Scope
- In: `src/app/_components/DashboardScreen/components/SavingsSection/**`,
  the two stale comments in `Board/index.tsx`.
- Out: `GoalCard/**` (task 02 owns it), `e2e/**` (task 03), `SectionCard` — this card
  is hand-rolled, do not try to route it through `SectionCard`.

## Verify
- `npm run lint`
- `npx playwright test e2e/row-overflow.spec.ts` — green.
- `npx playwright test e2e/goals.spec.ts` — CORRECTED AT RUN TIME (2026-07-31). This
  file first predicted green here; that was wrong. Wrapping the block in a `<section>`
  makes that section an ANCESTOR of every goal's `<h3>`, and Playwright's `has:` is
  descendant-scoped — so `readGoals`'s `section:has(h3)` root matches the card too and
  returns one extra bogus entry that sweeps up every goal's `dt`/`dd`. Two tests fail,
  both off that inflated count: `expectParallelShare` computes
  `count * alone - (count - 1)` as `3*71-2 = 211` where the true two-goal figure is
  `2*71-1 = 141` — exactly the received value. The suite is red from here until task
  03, as task 02's Verify already anticipates. Confirm those TWO failures and no more.
- On screen at 1440 and 375: the fill reaches the card's inner edge on both sides and
  the card's top corners are not squared off by it.

## Forbidden
- No `overflow: hidden` on the card (see Context).
- No hardcoded colour, length, radius or duration — tokens only (`src/styles/README.md`
  rule 1). The stripe overlay already goes through `color-mix` for exactly this reason
  (`_banner.scss:40-55`); keep it.
- Do not give the goal cards below the hard offset shadow: rule 3 scopes it to a card
  carrying a fill, and `GoalCard/style.module.scss:12-15` already refuses it.
- Do not change what the hook returns or any wording on screen.
