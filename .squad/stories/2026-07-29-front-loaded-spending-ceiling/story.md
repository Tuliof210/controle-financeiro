# Front-loaded spending ceiling

## Why
The ceiling answers with a single flat rate spendable every month until the range
end — the most conservative answer, not the most useful one. Money that only
exists in a distant month stays invisible, and the owner cannot see what THIS
month can actually carry.

## Acceptance Criteria
- [x] The Teto de Gastos card lists one extra-spending figure per month, from the
      current month to the range end
- [x] Each month's figure already discounts everything the earlier months
      authorised, so spending every listed figure in order never drives any
      month's worst projected balance below zero
- [x] The headline is the current month's figure, captioned as this month's, with
      its /sem and /dia splits
- [x] Each row shows its own figure in the foreground; the bar beside it carries
      its own labelled pair ("restam X de Y")
- [x] A period containing a red month still shows only the first-hole note and no
      bars
- [x] The card's hint states the formula that is actually running
- [x] The Objetivos tab shows exactly the numbers it shows today

## Definition of Done
- [x] `npm run lint` clean
- [x] `npm run build` clean
- [x] `npm run test:e2e` green
- [x] The ceiling spec goes red when the accumulator's subtraction is removed from
      the payload, and green again when restored

## Tasks
- [x] tasks/01-suffix-minimum-budget.md — replace the flat-rate ceiling with a
      suffix minimum plus a running accumulator, in the payload
- [x] tasks/02-per-month-budget-card.md — the card lists each month's own figure
      and the hint explains the running formula
- [x] tasks/03-accumulator-e2e.md — the spec pins the accumulator instead of the
      flat rate
