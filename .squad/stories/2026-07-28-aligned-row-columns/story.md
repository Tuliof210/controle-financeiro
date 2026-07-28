# Align every list row on a shared column grid

## Why
Rows on Recorrências, Movimentações and Configurações explode into four or five
stacked lines even where the card has room to spare — the colour swatch lands alone on
one line and the edit/delete pair takes another. Nothing lines up between sibling rows,
so a list can't be scanned down a column. The owner hits this on a normal desktop.

## Acceptance Criteria
- [ ] Within one list, every row's name starts at the same x and every amount ends at
      the same x — the columns align down the list
- [ ] Where the row is wide enough, name, amount, metadata and the edit/delete pair
      share one line, and the swatch never occupies a line of its own
- [ ] Below that width the row collapses into a deliberate stack, not an emergent wrap
- [ ] A column no row in a list fills takes no width
- [ ] No screen scrolls horizontally at 375px, 768px or 1024px
- [ ] Income vs expense stays legible without relying on colour alone

## Definition of Done
- [ ] `npm run test` green, including assertions that fail on a row whose actions leave
      the primary line while the row is still wide, and on misaligned columns
- [ ] `npm run lint` and `npm run build` green
- [ ] `src/components/RowLayout/` no longer exists and nothing imports it
- [ ] `wc -l` on every file created or touched is <= 100

## Tasks
- [ ] tasks/01-entry-rows-column-grid.md — build the list-level column primitive and
      put Recorrências + Movimentações on it, with a spec that catches the exploded row
- [ ] tasks/02-settings-rows-column-grid.md — move Pessoas and Objetivos onto it and
      delete RowLayout
