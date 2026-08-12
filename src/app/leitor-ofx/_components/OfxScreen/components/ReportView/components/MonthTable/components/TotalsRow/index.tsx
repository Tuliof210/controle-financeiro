import { type TotalsRowProps, useTotalsRow } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  total: "Total",
} as const;

export function TotalsRow(props: TotalsRowProps) {
  const { income, expense, balance, count, negative } = useTotalsRow(props);

  return (
    <tr className={styles.row}>
      <th scope="row" className={styles.label}>
        {COPY.total}
      </th>
      <td>{income}</td>
      <td>{expense}</td>
      <td className={negative ? styles.negative : undefined}>{balance}</td>
      <td>{count}</td>
    </tr>
  );
}
