import { type TotalsRowProps, useTotalsRow } from "./hook";
import styles from "./style.module.scss";

export function TotalsRow(props: TotalsRowProps) {
  const { income, expense, balance, count, negative } = useTotalsRow(props);

  return (
    <tr className={styles.row}>
      <th scope="row" className={styles.label}>
        Total
      </th>
      <td className={styles.reserved}>{income}</td>
      <td className={styles.reserved}>{expense}</td>
      <td className={negative ? styles.negative : undefined}>{balance}</td>
      <td>{count}</td>
    </tr>
  );
}
