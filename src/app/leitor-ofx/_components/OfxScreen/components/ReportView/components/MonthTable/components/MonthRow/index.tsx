import { type MonthRowProps, useMonthRow } from "./hook.ts";
import styles from "./style.module.scss";

export function MonthRow(props: MonthRowProps) {
  const { label, income, expense, balance, count, negative } =
    useMonthRow(props);

  return (
    <tr>
      <th scope="row" className={styles.label}>
        {label}
      </th>
      <td className={styles.income}>{income}</td>
      <td className={styles.expense}>{expense}</td>
      <td className={negative ? styles.expense : undefined}>{balance}</td>
      <td className={styles.count}>{count}</td>
    </tr>
  );
}
