# Per-row grid areas, owner chip and metadata line

## Outcome
- A Movimentações or Recorrências row reads as: chip with the owner's initial,
  the name on its own line, `Owner · Period` smaller and muted beneath it, the
  amount flush right on the name's line.
- Rows no longer share columns with their siblings; each row lays itself out.

## Context
The design's row (`Monevo.dc.html`, movimentações; recorrências adds the `bar`
row that task 03 fills):

```
--row-cols:26px minmax(0,1fr) auto auto; --row-areas:"who main amt act";
--amt-just:end; --amt-size:var(--text-md);   /* narrow: "who main act" / ". amt amt" */
```
```html
<div data-row style="display:grid;…align-items:center;column-gap:var(--space-3);
  row-gap:var(--space-2);padding:var(--row-py) var(--space-2);
  border-bottom:var(--border-1) solid var(--c-line)" style-hover="background:var(--c-raised)">
  <span style="{{ r.avatar }}">{{ r.initial }}</span>
  <div style="grid-area:main;min-width:0">
    <div style="font-size:var(--text-base);overflow:hidden;
      text-overflow:ellipsis;white-space:nowrap">{{ r.name }}</div>
    <div style="…gap:var(--space-2);margin-top:3px;font-size:var(--text-2xs);
      color:var(--c-muted);letter-spacing:var(--tracking-wide)"><span>{{ r.person }}</span>
      <span style="width:4px;height:4px;flex:none;background:var(--c-line)"></span>
      <span>{{ r.month }}</span></div></div>
  <span style="grid-area:amt;justify-self:var(--amt-just);font-size:var(--amt-size);
    font-variant-numeric:tabular-nums;color:var(--c-pos);white-space:nowrap">{{ r.value }}</span>
```
`r.avatar` = `26px` square, `--radius-sm`, `--border-1 solid var(--c-border)`,
`color:var(--ink-900)`, `background:<person colour>`. Token map: `--c-line`→
`--color-border-subtle`, `--c-raised`→`--color-surface-raised`, `--c-muted`→
`--color-text-muted`, `--c-pos`/`--c-neg`→`--color-positive`/`--color-negative`,
`--row-py`→`--space-3`, off-grid `3px`→`--space-1`.

- **RowGrid survives, its columns do not.** Keep the `<ul>` (three e2e locators
  go through `getByRole("list")`/`getByRole("listitem")`), its
  `container-type: inline-size` and its `row-gap`. Delete the six-track
  `grid-template-columns`, every `subgrid`, every `[data-cell]` placement rule,
  the `--col-owner` collapse hack (dead once tracks stop being shared) and
  `_stack.scss` outright — `style.module.scss` is at 98 of 100 lines today, and
  that is where the row's own areas get their headroom.
- **Keep `container-type` on the list, not on the row**, and use no media query.
  An element is never its own query container, so the design's `@container …
  { [data-row] { … } }` would silently never match; `container-type` on a grid
  item also zeroes its intrinsic contribution. Every row in a list is the same
  width, so one container on the `<ul>` — what the code already does — is
  equivalent. `RowGrid/style.module.scss` records why the viewport can't decide
  this: *"this shell moves a row BACKWARDS as the window grows (680px at a 764px
  viewport, 372px at 768px)"*, so the `@media (max-width:560px)` half of the
  design re-imports a bug the last story removed.
- **Three tiers, and the design only draws two.** Its single 440px collapse is
  wrong at both ends: entry rows need one line's worth of room well above it, and
  a Configurações row at a 768px viewport is 148px wide, where `who + name + 2
  buttons` on one line leaves the name far under the e2e's 100px floor. A third
  tier dropping the action pair to its own row is required — `_stack.scss` did it
  at 259px for the old anatomy. **Re-derive all three by measuring the new row**;
  do not copy 440 or the old numbers. `EntryScreen`'s `@container (min-width:
  1456px)` is derived from the old 660px one-line floor (`2 × (660 + 48 card
  padding) + 24 gap + 16 slack`) — recompute it too.
- **The chip's ink must be a primitive.** Fills are `--violet-400 … --cyan-400`
  (theme-independent, `src/styles/_swatch-colors.scss`). `var(--ink-900)` clears
  4.5:1 on all seven — `var(--color-text)` does not: it flips in dark theme and
  drops to 1.22:1 on lime. Precedent: GoalCard/HeroCard/ReportView all hardcode
  `--ink-900` on a coloured fill. Set it once on the chip class; do not double
  `_swatch-colors.scss`, whose comment explains why it is a flat map. Keep the
  chip `aria-hidden` — the initial is redundant with the owner name now in the
  metadata line, and un-hiding it puts a stray letter into every row's accessible
  name, which three e2e locators read. `--radius-sm`, not `--radius-full`, which
  `_tokens.scss` scopes to *"avatars / status dots ONLY"*.
- **`person` can be `undefined`** (`EntrySection/hook.ts` does
  `people.find(p => p.id === item.ownerId)`; the row falls back to
  `owner: person?.name ?? "—"`). Decide the chip's no-person rendering
  explicitly — a letterless neutral fill, or no chip — never `"—"[0]`.
- **Ellipsis replaces `overflow-wrap: anywhere`, and needs three things.**
  `overflow: hidden` on the name element only — never on the row or `main`, where
  it clips both task 01's hit overlay and the `outline-offset` focus ring
  (`SectionCard/style.module.scss`: "no `overflow: hidden` here, ever");
  `display: block` on the name, since `text-overflow` is inert on an inline box;
  `min-width: 0` on `main`, or the seeded 65-char `LONG_NAME` re-inflates the
  `1fr` track from the inside.
- **The amount must stay a single leaf element.** `e2e/row.helper.ts` finds it
  with `row.getByText(/^R\$/)`, and `.squad/learnings.md` warns that regex
  *"matches the wrapper too once the wrapper's own text starts there"* — a
  wrapper+inner span resolves to two nodes and kills strict mode.
- **The `who` track is `auto`, not a fixed 26px** — a goal row (task 04) has no
  chip and would otherwise pay a permanent empty indent; this also closes the
  `.squad/debt.md` entry about `[data-cell]:first-child` assuming a swatch. Button
  size comes from task 01's `--icon-btn-size`, set on the row and stepped up
  inside the narrow container query, never from a viewport media query.

## Scope
- In: `src/components/RowGrid/**` (delete `_stack.scss`),
  `src/components/EntryRow/**`, `src/components/EntryScreen/style.module.scss`,
  `e2e/row.helper.ts`, `e2e/row-columns.spec.ts`.
- Out: the Configurações rows (task 04), the coverage bar (task 03).

## Verify
- `npm run lint`, then `wc -l` every touched file — Biome scores neither `.scss`
  nor the 100-line cap as an error.
- `npm run test` — **kill any `next dev` running in this directory first**, Next
  16 refuses a second one per directory and the suite dies before it starts.
- `aligns its columns` runs at WIDE **and NARROW** and asserts
  `short.valueRight ≈ long.valueRight`. In the collapsed mode the amount drops to
  its own line left-aligned, so that assertion stops describing the design:
  narrow it to the one-line mode and give the collapsed mode its own (the amount
  starts where the name starts). Say why in the spec's comment. `GUTTER` and
  `PAIR_GAP` in `e2e/row.helper.ts` are hand-derived from the CSS this task
  rewrites — re-derive both in the same commit.
- Measure the three collapse thresholds in the browser preview by narrowing until
  the row's own width (not the window's) stops holding one line.

## Forbidden
- Turning the `<ul>`/`<li>` into anything else, or `display: contents` on a row.
- A viewport media query anywhere in the row's layout.
- `var(--color-text)` (or any themed token) as the chip's ink.
- Loosening any e2e assertion to make it pass — narrowing one to the mode it
  describes is fine, deleting the guarantee is not.
