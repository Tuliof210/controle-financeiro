import { CopyButton } from "./components/CopyButton";
import { type MonthRowProps, useMonthRow } from "./hook";
import styles from "./style.module.scss";

export function MonthRow(props: MonthRowProps) {
  const {
    label,
    income,
    expense,
    balance,
    count,
    negative,
    copyIncome,
    copyExpense,
    copyIncomeLabel,
    copyExpenseLabel,
  } = useMonthRow(props);

  return (
    <tr>
      <th scope="row" className={styles.label}>
        {label}
      </th>
      <td className={styles.income}>
        <span className={styles.cell}>
          {income}
          {/* The slot is rendered whether or not it holds a button, so a zero
              row's digits land on the same right edge as a row with one. */}
          <span className={styles.slot}>
            {copyIncome ? (
              <CopyButton text={copyIncome} label={copyIncomeLabel} />
            ) : null}
          </span>
        </span>
      </td>
      <td className={styles.expense}>
        <span className={styles.cell}>
          {expense}
          <span className={styles.slot}>
            {copyExpense ? (
              <CopyButton text={copyExpense} label={copyExpenseLabel} />
            ) : null}
          </span>
        </span>
      </td>
      <td className={negative ? styles.expense : undefined}>{balance}</td>
      <td className={styles.count}>{count}</td>
    </tr>
  );
}
