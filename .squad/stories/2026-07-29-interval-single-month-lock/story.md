# Single-month lock on an interval row

## Why
Registering a forecast that happens once — or on a couple of scattered months —
means filling Início and Fim with the same value on every row. The form asks for
a range when the user only has a month, and two pickers where one would do.

## Acceptance Criteria
- [ ] Each interval row on /previsoes' forecast form carries its own "mês único"
      control; two rows in the same form can be in different states.
- [ ] With it on, the row shows exactly one MonthPicker, spanning the width the
      pair used to take; picking a month sets both ends of that interval.
- [ ] With it off, the row shows the Início/Fim pair unchanged, and the Fim value
      differs from Início so the row stays off until the user says otherwise.
- [ ] Reopening a saved forecast shows a one-month interval already locked.
- [ ] Saving from a locked row stores that single month — the request body, the
      row's period text and the "Adicionar intervalo"/remove behaviour are all
      unchanged from today.

## Definition of Done
- [ ] `npm run lint` clean
- [ ] `npm run build` clean
- [ ] `npm run test` green, including the new spec

## Tasks
- [x] tasks/01-lock-toggle.md — per-row lock inside IntervalList, derived from
      `start === end`, no change to the component's props
- [ ] tasks/02-e2e-spec.md — Playwright spec driving the lock through create,
      save and reopen
