# Teto de Gastos: cap selector replaces the average hypothesis

## Why
The card reads every month twice — once spending its own ceiling, once spending
the period's mean — and the owner no longer reads the mean half. Meanwhile the
one number deciding every figure on the card, the 80% cap, is hardcoded and
unreachable.

## Acceptance Criteria
- [ ] Nothing on the dashboard says "média dos tetos": one headline, one
      hypothesis, four table columns (month + saldo/teto/sobra).
- [ ] The card's header-end carries a 25 / 50 / 75 segmented control.
      "Limitado por <mês>" and the current-month badge survive, moved to a line
      under the title.
- [ ] Picking a cap recomputes the WHOLE payload: the ceiling figures, the
      savings-capacity banner and the goal projections all move together.
- [ ] A lower cap gives every month a lower-or-equal ceiling, and no cap makes a
      month close under (`sobra` never negative).
- [ ] 50% is selected on load. The choice resets on reload — nothing persisted.
- [ ] Changing the cap does not blank the board, does not scroll-jump, and does
      not collapse an already-expanded month table.

## Definition of Done
- [ ] `npm run lint` exits 0 with no NEW `noExcessiveLinesPerFile` info beyond
      the 5 already on main
- [ ] `npm run build` succeeds
- [ ] `npm test` green

## Tasks
- [x] tasks/01-drop-average-scenario.md — delete the second hypothesis end to
      end: payload, card, table, hint, e2e
- [x] tasks/02-cap-parameter.md — `buildCeiling` takes a cap; `?cap=` reaches it
      through route → service → payload, validated, defaulting to 50
- [x] tasks/03-cap-selector.md — the segmented control, the header re-layout,
      and the cap state driving the fetch
- [x] tasks/04-refetch-without-blanking.md — a cap change revalidates in place
      instead of unmounting the board
- [ ] tasks/05-e2e-cap.md — one e2e proving the cap reaches the numbers
