# Give every list row a responsive information hierarchy

## Why
Every row on Recorrências, Movimentações and Configurações crams identity, name,
amount, period and two 44px action buttons into one flex line. Below roughly a
laptop width the delete button breaks away from its own row and the page starts
scrolling sideways — the owner hits this on a normal desktop, not just on a phone.

## Acceptance Criteria
- [ ] One row primitive in `src/components/` owns the row layout, and Recorrências,
      Movimentações, Pessoas and Objetivos all render through it
- [ ] Name and amount read as the primary tier, owner and period as secondary
      metadata; the edit/delete cluster stays adjacent to its own row at every width
- [ ] No screen scrolls horizontally at 375px, 768px or 1024px
- [ ] Income vs expense is still legible without relying on colour alone

## Definition of Done
- [ ] `npm run test` green, including a spec that drives all three screens at mobile
      and small-desktop widths and fails on horizontal overflow
- [ ] `npm run lint` and `npm run build` green
- [ ] `wc -l` on every file created or touched is <= 100

## Tasks
- [ ] tasks/01-shared-row-primitive.md — extract the row primitive, adopt it in
      Recorrências + Movimentações, land the e2e overflow spec
- [ ] tasks/02-settings-rows-adopt-primitive.md — move Pessoas and Objetivos onto it
