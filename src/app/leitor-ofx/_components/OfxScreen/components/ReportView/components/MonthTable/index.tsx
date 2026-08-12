import { MonthRow } from "./components/MonthRow/index.tsx";
import { TotalsRow } from "./components/TotalsRow/index.tsx";
import { type MonthTableProps, useMonthTable } from "./hook.ts";
import styles from "./style.module.scss";

export function MonthTable(props: MonthTableProps) {
  const { rows, totals } = useMonthTable(props);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>Entradas e saídas por mês</caption>
        <thead>
          <tr>
            <th scope="col">Mês</th>
            <th scope="col">Entradas</th>
            <th scope="col">Saídas</th>
            <th scope="col">Saldo</th>
            <th scope="col">Lanç.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <MonthRow key={row.month} month={row} />
          ))}
        </tbody>
        <tfoot>
          <TotalsRow {...totals} />
        </tfoot>
      </table>
    </div>
  );
}
