# Teto de Gastos: the ink band and the two-pane split

## Outcome
- The card wears the inverted-ink header band, with the cap selector riding it at
  the far end, legible and operable against the dark fill in both themes.
- From `xl` up the body is two panes reaching the card's inner edges: a summary
  pane on the raised surface — the two badges, "Gasto extra este mês" and its
  figure, then POR SEMANA and POR DIA as two labelled figures — and the month
  table beside it, with its count and "Ver todos" below. Under `xl` the two stack
  in that order, as today.
- Every e2e contract on this card survives: a `<section>` holding the heading
  "Teto de Gastos", a real `<table>` whose `tbody tr` keep four cells in the same
  order, the money figure as the card's first `<dd>` with the months-left chip in
  that same `<dd>`, `title="Mês em curso"` on the current-month badge, and the cap
  radios labelled exactly `25%` / `50%` / `75%`.

## Context
Design: `design.html` **450-534** — band 451-470 (the cap control at 462-469),
summary pane 473-493, table pane 495-532.

**The band and the bleed.** Task 01 gave `SectionCard` a full-width header band;
whatever that task used to reach the card's inner edges from inside a padded
body is what the two-pane split reuses. Do not invent a second mechanism and do
not add a second `SectionCard` prop. `.headerEnd` already carries `CapSelector`
into the title row (`margin-left: auto`), so the control needs no new home — only
new colours, because its current recipe assumes a light card:
```scss
.text            { background: var(--color-surface); color: var(--color-text-muted); }
.input:checked + .text { background: var(--color-text); color: var(--color-surface); }
```
Both read wrong on an inverted fill. The `min-height: 44px` in that file is
README rule 7(e)'s floor and stays — its comment already records *"The design
draws a shorter chip; the floor wins."* So do `@include t.focus-ring` with
`outline-offset: -4px`, the clipped `<legend>`, and the native
`<input type="radio">` inside the `<fieldset>`: `e2e/ceiling-cap.helper.ts`
drives them with `getByRole("radio", { name: "25%" })`, `.toBeChecked()` and
`page.keyboard.press("ArrowRight")`.

**The split point.** The design splits at 1320px into `380px` + the rest. This
repo's breakpoint map is closed — `sm 480 / md 768 / lg 1024 / xl 1280` — so `xl`
is the stop. The summary pane's fixed track is a raw width with no token behind
it; give it the same `ponytail:` comment `.page`'s `max-width: 1560px` already
carries rather than inventing a size scale. Use `minmax(0, 1fr)` for the table
track, never a bare `1fr`.

**What moves and what does not.** `useCeilingCard` already returns `monthly`,
`splits`, `monthsLeft`, `limitedBy`, `currentLabel`, `count`, plus the rows. Today
`splits` is one string, `` `${weekly}/sem · ${daily}/dia` ``; the design shows two
labelled figures, so split it at the hook. The `Headline` keeps `monthly` and the
`monthsLeft` chip inside its `<dd>` — `e2e/ceiling-expect.helper.ts`'s
`expectHeadlineIsFirstRow` anchors on `/^R\$ [\d.]*\d,\d\d/` against
`card.locator("dd").first()`, so nothing may precede it in the DOM and nothing may
break that `^`. Any new `<dd>` goes after it.

The table's `<caption>` — *"Saldo acumulado mês a mês, se cada mês gastar o seu
teto"* — stays on the `<table>`, where it is the table's accessible name. The
design repeats that sentence as prose in the summary pane; do not duplicate it.

**The badges** `.limit` / `.now` already exist in `CeilingCard/_badges.scss` as a
mixin (57 lines); they move into the summary pane by markup, not by rewrite.
`.now` uses `background: var(--color-text); color: var(--color-surface)` — check
it still clears 4.5:1 against the raised surface the pane sits on.

**Re-measure the table.** `MonthTable/_stacked.scss` collapses the table at a
**container** width of 489px, measured against the card. This task makes the
table's box narrower at exactly the widest viewports, which is the one thing that
threshold was tuned around: its comment records card widths 291 at 375, 372 at
768, 628 at 1024, and `.squad/debt.md` records the min-content as 442px today and
481px at `R$ 187.440,00`. Measure the table pane at 1280 and 1440 in the browser
preview; if the pane now falls below 489 at a width where the tabular tier still
fits, move the threshold and replace the measured widths in that comment with the
ones you took.

`SectionCard`'s stylesheet forbids `overflow: hidden` — the hint trigger's focus
ring is an outline with `outline-offset` and an overflow ancestor clips it on 13
cards at once.

## Scope
- In: `components/CeilingCard/index.tsx` + `hook.ts` + `style.module.scss` +
  `_badges.scss`, `components/CeilingCard/components/CapSelector/**`,
  `components/CeilingCard/components/MonthTable/_stacked.scss` (threshold and its
  comment only).
- Out: `src/components/SectionCard/**` (task 01 settled its API),
  `MonthTable/index.tsx` and its `style.module.scss` (task 05), `ShowAllToggle/`,
  `hints.ts`, `src/app/api/dashboard/**`, every `e2e/` file.

## Verify
- `npm run lint`; `wc -l` every touched file including all three `.scss`.
- `npm run build`; `npm test` — stop any `npm run dev` first, Next 16 locks per
  directory so a server on :3000 blocks Playwright's own on :3100. `ceiling.spec.ts`
  and `goals.spec.ts` are the two that read this card.
- Browser preview at 375, 767, 768, 1024, 1280, 1440, both themes: the panes stack
  under `xl` and split at and above it, the summary pane's surface reaches the
  card's inner edges, and no figure wraps mid-number.
- Click each cap segment on the band and confirm the figures still move; Tab to
  the group once and drive it with arrow keys; confirm the focus ring is visible
  against the dark fill in both themes.
- Report the measured table-pane width at 1280 and 1440 and say whether 489 held.

## Forbidden
- Do not turn the table into `<div>`s, do not add, drop or reorder a cell.
- Do not replace the native radios with buttons carrying `role="radio"`.
- No `overflow: hidden`, no raw colour, no radius above `--radius-md`.
- Do not change any figure, label or badge wording.
