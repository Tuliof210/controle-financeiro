# Move the Configurações rows onto the column grid and delete RowLayout

## Outcome
- Pessoas and Objetivos render through the list primitive task 01 established, aligned
  down their own columns, and a column no row in that list fills takes no width — a
  person row reserves no space for an amount it never has.
- Both lists keep their content and the edit/delete pair on one line at the width the
  Configurações cards actually get, which is narrower than any entry card.
- `src/components/RowLayout/` is gone and nothing imports it.

## Independently shippable
yes

## Scope
- In: `src/app/configuracoes/_components/SettingsScreen/**`, deletion of
  `src/components/RowLayout/`, `e2e/`
- Out: `src/components/EntryRow/` and the entry screens, `MonthlyGoalSection`'s own
  card, the person/goal forms, and their API routes
- Imitate: whatever contract task 01 landed for the list primitive — this task adopts
  it, it does not redesign it. If a Configurações row can't be expressed through that
  contract, that is a finding to report, not a local override to write.
- Reuse: `_swatch-colors.scss` for the person dot, `formatMoney` from
  `src/lib/money.ts`, and task 01's spec helpers in `e2e/`

## When to run
- Depends on: 01
- Parallel-safe with: none

## Verify
- Measure a Pessoas row's rendered inline size at 1024px before deciding anything —
  it is the narrowest row in the app and the reason the previous layout broke worst
  here, where the content is smallest.
- Extend the e2e spec to `/configuracoes` at the same widths, asserting the same
  column-alignment and same-line rules task 01 introduced, then `npm run test`.
- `grep -rn "RowLayout" src/` returns nothing.
- `npm run lint` && `npm run build`.
- `wc -l` every file you created or touched.

## Forbidden
- Do not widen the Configurações cards or change the `SettingsScreen` grid to make the
  rows fit — the row has to work at the width it is given.
- Do not give Pessoas or Objetivos a private copy of the row CSS; a divergence here is
  the thing this story exists to remove.
- Do not drop the swatch's meaning or the per-row `aria-label`s that name the person or
  goal, and keep the 44px hit target on both icon buttons.
