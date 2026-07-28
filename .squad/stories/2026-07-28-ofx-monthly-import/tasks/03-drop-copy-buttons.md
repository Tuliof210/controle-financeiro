# Remove the per-cell copy buttons from the monthly table

## Outcome
- No copy affordance remains in the Entradas/Saídas cells; each cell renders its amount
  and nothing else.
- The amounts still form a column — every row's value ends on the same x, as it did when
  the empty slot was reserving space.
- `.../MonthRow/components/CopyButton/` no longer exists and nothing imports it.

## Context
- **Delete wholesale** — nothing outside the folder imports these:
  `.../ReportView/components/MonthRow/components/CopyButton/{index.tsx,hook.ts,copy-text.helper.ts,style.module.scss}`
- **In `MonthRow/index.tsx`**, the two wrapper spans collapse to a bare value:
  ```tsx
  <td className={styles.income}>
    <span className={styles.cell}>
      {income}
      <span className={styles.slot}>
        {copyIncome ? <CopyButton text={copyIncome} label={copyIncomeLabel} /> : null}
      </span>
    </span>
  </td>
  ```
- **In `MonthRow/hook.ts`**, four returned values go with them — `copyIncome`,
  `copyExpense`, `copyIncomeLabel`, `copyExpenseLabel` — and with them the `formatCents`
  import. `formatMoney` is still used; do not drop it.
- **In `MonthRow/style.module.scss`**, `.cell` and `.slot` both become dead. `.slot`
  carries the reasoning for its own existence, and that reasoning is what you must
  re-check after removal rather than trust:
  > "Reserved on EVERY row, empty or not. Without it the button — not the number — is
  > what meets the column edge […] That would defeat the tabular-nums the table sets on
  > exactly these cells."
  With no button in the cell that hazard is gone; `.label`, `.income`, `.expense` and
  `.count` stay.
- **Watch out for** `ReportView/style.module.scss`, whose `.table { min-width: 560px; }`
  is justified by a comment naming "five numeric columns **plus the copy slot**". Two
  44px slots just left. Re-measure the table's real content width at 375px in the browser
  and set the floor from that measurement — do not compute it by subtraction.
- **Watch out for** `CopyButton/style.module.scss`, whose only rule is a local
  visually-hidden `.sr` class with the comment "There is no visually-hidden utility class
  in this repo — grepped, none exists". Task 04 may want sr-only text; it will have to
  write its own. Do not pre-emptively promote this class into `src/components/`.
- **Verify with** `npm run test` — the suite is 2 spec files / 25 tests today and neither
  touches `/leitor-ofx`, so a green run here proves no regression rather than proving the
  removal. Note `CLAUDE.md` and `.squad/ARCHITECTURE.md` both still claim `e2e/` is empty
  and that `--pass-with-no-tests` is in play; both are stale, the flag exists nowhere.

## Scope
- In: `src/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthRow/**`
  and the `.table` rule in `.../ReportView/style.module.scss`
- Out: `ReportView/index.tsx`, `ReportView/hook.ts`, `TotalsRow/`, `AccountLine/` — and
  do not add the import button here; task 04 owns it

## Verify
- Load `/leitor-ofx`, upload an OFX with at least one zero month and one non-zero month,
  and confirm every amount in a column ends on the same x — measure a `Range` over each
  cell's contents, not `boundingBox()`: `.squad/learnings.md` records that a stretched
  grid/flex cell makes `boundingBox()` blind to alignment.
- Confirm the table does not scroll horizontally at 375px after the new `min-width`.
- `grep -r "CopyButton\|copy-text\|copyIncome\|copyExpense" src` returns nothing.
- `npm run lint` && `npm run build` && `npm run test`.
- `wc -l` every file you touched.

## Forbidden
- Do not remove `tabular-nums` or the right alignment from the numeric cells — the
  column is the point of the whole removal.
- Do not delete `.label`, `.income`, `.expense` or `.count` from `MonthRow/style.module.scss`.
- Do not touch `src/components/AppShell/components/Header/components/ThemeToggle/`,
  which has its own unrelated local `styles.slot`.
- Do not leave the 560px floor in place unmeasured, and do not replace it with a value
  you derived arithmetically instead of observing.
