# RowGrid's gutter reset keys on the column, not on source position

## Outcome
- Whichever cell is leftmost **in the grid** starts flush at the row's edge, for
  every row variant and in every tier.
- A goal row's name and its dropped amount start at the same x below the one-line
  floor; today they differ by 12px.
- A row that omits a cell still costs nothing for the omitted cell's gutter.
- Closes `.squad/debt.md:29`.

## Context

**The rule, and the comment two lines above it that describes the opposite** —
`src/components/RowGrid/style.module.scss:51-61`:
```scss
  // Placement is by `data-cell`, never by source position, so a row that omits
  // a cell keeps every other one in its area. The gutter belongs to the cell
  // that needs it: an absent cell costs nothing, and whichever cell comes first
  // starts flush at the row's edge.
  > [data-cell] {
    margin-inline-start: var(--space-3);
  }

  > [data-cell]:first-child {
    margin-inline-start: 0;
  }
```
`:first-child` is DOM source order; placement is `grid-area`. They agree only
when a row's first-in-source cell is also its leftmost-in-grid cell.

**Why gutters ride on cells at all** — `style.module.scss:22-27`, the constraint
any fix must preserve:
> `who` is `auto`, not the design's fixed 26px, so a chipless row (a goal) pays
> nothing for it — and since the gutters ride on the cells rather than on
> `column-gap`, nothing for its gutter either: a gap is billed between two tracks
> even when one holds no item.

So `column-gap: var(--space-3)` is **not** the fix; it re-bills the empty `who`
track. `column-gap: 0` is set deliberately at L34.

**The three row variants, in source order.** Only one is broken:
- `src/components/EntryRow/index.tsx` — `who, main, amt, act[, bar]`. First child
  is `who`, which is also leftmost. Correct by coincidence.
- `.../PeopleSection/components/PersonRow/index.tsx` — `who, main, act`. No `amt`.
  Immune.
- `.../GoalsSection/components/GoalRow/index.tsx` — **`main, amt, act`, no `who`**,
  with this header comment:
  ```tsx
  // The same cells an entry row uses, tagged with the same grid areas. A goal has
  // no chip and no metadata line, so the `who` area takes no width at all and the
  // name starts flush at the row's edge.
  ```

**Where it bites.** At the first tier, `_tiers.scss:20-27`:
```scss
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas: "who main act" ". amt amt";
```
`amt` drops to line 2 and becomes the leftmost painted cell of that line, but it
is source-position 2 of 3, so it keeps its 12px while the name above it (source
first) has 0. `_tiers.scss:12-14` says they are meant to align:
*"starting where the name starts rather than stranded at the right edge"*. At the
second tier (`"who main" "amt amt" "act act"`), `amt` and `act` each span both
columns from the row's true left edge and both still carry 12px.

- **Watch out for** the one spec that measures this gutter — and it only runs on
  the list that cannot show the bug. `e2e/row-columns.spec.ts`, inside
  `puts a wide row on one line`, guarded by `if (list.bare)` (Pessoas only, at
  `WIDE` only):
  ```ts
        const gap = cells.edit.x - (cells.name.x + cells.name.width);
        expect(gap).toBeLessThan(GUTTER + 1);
        expect(gap).toBeGreaterThan(GUTTER - 1);
  ```
  `GUTTER = 12` in `e2e/row.helper.ts:31`, a hand-copy of `--space-3`. The comment
  there explains it is a two-sided band on purpose: a rule that stopped matching
  would collapse every gap to 0 and pass a ceiling-only assertion.
- **Watch out for** `aligns its columns`, which compares two rows *within the same
  list* — a uniform 12px error cancels out and it stays green. That is why this
  bug survived; a new assertion has to compare a cell against its **row's edge**,
  not against a sibling row.
- **Watch out for** `> [data-cell="bar"] { grid-column: 2 / -1 }` — always inset,
  never leftmost, must not gain a reset.
- **Verify with** `npm run lint`, `npm run test:e2e`.

## Scope
- In: `src/components/RowGrid/style.module.scss`, `src/components/RowGrid/_tiers.scss`,
  and a new/extended assertion in `e2e/row-columns.spec.ts`.
- Out: the three row components' JSX. Reordering `GoalRow`'s cells or giving it an
  empty `who` span would "fix" the symptom by making source order match the grid —
  that is the coupling this task removes, not a solution to it.

## Verify
```
npm run lint
npm run test:e2e
```
Add an assertion that fails today: on `/configuracoes`, at a viewport where a goal
row is below the one-line floor, the name's left edge and the dropped amount's
left edge must match. Use `textEdges` from `e2e/row.helper.ts` for the amount —
its comment explains why the box is not the text:
> The amount's box is not the amount. Its cell stretches to fill the grid track,
> so the box ends at the track's edge whether the text inside is flushed there or
> not — a box-only assertion stays green with the alignment visibly broken.

Measure the viewport that puts a Configurações goal row under the floor at
execution time; do not copy a width from another spec — task 03 moves the rail.

## Forbidden
- Do not reintroduce `column-gap` on the row; the empty `who` track would bill it.
- Do not hardcode the gutter anywhere but `--space-3`.
- Do not make the reset depend on a class the row components would have to add —
  placement is by `data-cell` and must stay that way.
