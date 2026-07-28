# Two wrappers per row, one-line layout

## Outcome
- Each `<li>` on `/movimentacoes`, `/recorrencias` and `/configuracoes` contains
  exactly two children: a data wrapper (left) and a controls wrapper (right).
- At one-line widths the data cells still resolve against the LIST's tracks —
  the name's x and the amount's painted right edge match across sibling rows.
- The controls wrapper sits flush at the row's right edge, its two 44px buttons
  on one line, `var(--space-2)` apart.

## Context
Today the three rows emit flat cells and `src/components/RowGrid/style.module.scss`
places each by a direct-child selector. The cell set stays exactly as it is —
same `data-cell` names, same classes, same order; only the two wrappers are new.
Widest case, verbatim from `src/components/EntryRow/index.tsx` (PersonRow emits
swatch/name/actions, GoalRow name/value/actions — same shape, fewer cells):

```tsx
<li className={styles.row}>
  <span data-cell="swatch" className={swatchClass} aria-hidden />
  <span data-cell="name" className={styles.name}>{name}</span>
  <span data-cell="value" className={valueClass}>{value}</span>
  <span data-cell="owner" className={styles.owner}>{owner}</span>
  <span data-cell="period" className={styles.period}>{period}</span>
  <span data-cell="actions" className={styles.actions}> …2× IconButton… </span>
</li>
```

- **The subgrid chain is the whole trick.** `<ul>.list` declares the six tracks;
  `.list > li` must KEEP all three of `display: grid`, `grid-column: 1 / -1` and
  `grid-template-columns: subgrid` (lines 33-35). The data wrapper must be
  `display: grid; grid-template-columns: subgrid` with an **explicit**
  `grid-column: 1 / -2`, and the controls wrapper an explicit `-2 / -1`: a
  subgrid item that is auto-placed spans one track and lands wrong.
- **Restate what does not inherit.** `align-items: center` and `min-width: 0`
  (lines 36-37) govern the `<li>`'s two items only. Without `min-width: 0` on
  the data wrapper its min-content contribution — CoverageBar's
  `min-width: 160px`, an unbroken 60-char name — re-floors the very tracks that
  `minmax(0, 2fr)` and `overflow-wrap: anywhere` exist to let collapse.
- **No `container-type` on either wrapper.** `.list` is the query container
  (line 9) and every `@container` rule resolves to it from any depth. Size
  containment would also stop the box contributing to its own inline size —
  the opposite of what subgrid needs.
- **No `data-cell` attribute on a wrapper.** `> [data-cell] { margin-inline-start:
  var(--space-3); }` (line 57) would hand it the 12px gutter. Use a class.
- `:has([data-cell="owner"])` (lines 28, 90, 98) is descendant-scoped, so the
  `--col-owner: 0` collapse keeps working untouched. Leave it alone.
- **Re-root the gutter rules (57-58) into the data wrapper**, and give the
  controls wrapper its own leading gutter — today it gets 12px from line 57
  because it is never `:first-child`. Nothing asserts a gutter FLOOR:
  `row-columns.spec.ts` only has
  `expect(cells.edit.x - (cells.name.x + cells.name.width)).toBeLessThan(GUTTER + 1)`,
  so losing every gutter passes greener. Task 03 adds the guard.
- **`className={styles.actions}` resolves to `undefined`** — no `.actions` class
  exists in any of the three row stylesheets. The pair's `display: flex` and
  `gap: var(--space-2)` come ONLY from `> [data-cell="actions"]` (lines 48-53).
  Carry both onto the controls wrapper or the buttons become inline-flex boxes
  free to wrap, which no spec catches.
- **Wrappers are `<span>`, not `<div>`** — every cell is already a span and
  `CoverageBar/style.module.scss:1` states the convention. Inside the `<li>`
  they are AX-generic and change no list semantics; nothing may ever sit
  between `<ul>` and `<li>`.
- **Reuse**, unchanged: `useEntryRow` returns `{ name, swatchClass, valueClass,
  value, owner, period, onEdit, onDelete }`; `usePersonRow` returns
  `{ name, swatchClass, onEdit, onDelete }`; `useGoalRow` returns
  `{ name, value, onEdit, onDelete }`. No hook has layout in it.
- **e2e selectors survive** — `e2e/row.helper.ts` is role/text only
  (`getByRole("listitem").filter({ hasText })`, `getByRole("button", { name:
  \`Editar ${name}\` })`). One hazard: `row.getByText(/^R\$/)` matches any
  element whose text starts with `R$`, so keep the name cell before the value
  cell inside the data wrapper or that locator goes strict-mode ambiguous.
- **File size**: `RowGrid/style.module.scss` is at 99 of the 100-line cap and
  Biome ignores `.scss` entirely (proven: it reports the path as ignored), so
  nothing fails on its own. Prefer tightening its prose comments; a Sass partial
  beside it is acceptable if it still does not fit.
- Do not leave a manual `next dev` running from the repo root — Next 16 refuses
  a second dev server from the same directory and `npm run test` boots its own.

## Scope
- In: `src/components/RowGrid/style.module.scss`, `src/components/RowGrid/hook.ts`
  (its `children` doc comment describes the flat-cell contract and goes stale),
  `src/components/EntryRow/index.tsx`, `.../PeopleSection/components/PersonRow/index.tsx`,
  `.../GoalsSection/components/GoalRow/index.tsx`.
- Out: the three rows' `hook.ts` (no layout in them); the three rows'
  `style.module.scss` (their `.row` border/hover idiom keeps painting the `<li>`
  and must not move onto a wrapper); the `@mixin stack` block and its two
  `@container` call sites (task 02); `e2e/` (task 03).

## Verify
- `npm run lint`
- `npx playwright test row-columns.spec.ts -g "at 1440px"` — the narrow (375px)
  cases are **expected red after this task**; the stack mixin is task 02.
- `npx playwright test row-overflow.spec.ts -g "1024"`
- `wc -l` every touched file, `.scss` included.

## Forbidden
- Inserting anything between `<ul>` and `<li>`, or changing the `<li>` element.
- Dropping `display: grid`, `grid-column: 1 / -1` or `grid-template-columns:
  subgrid` from `.list > li` — the wrapper would then inherit the row's tracks
  instead of the list's and alignment drifts per row.
- Any hardcoded spacing, colour, radius or duration — tokens only.
- Shrinking or clipping the 44px IconButton squares.
- Renaming a `data-cell` value or adding a new one.
- Touching the `@mixin stack` block in this task.
