import { MonthRow } from "./components/MonthRow/index.tsx";
import { TotalsRow } from "./components/TotalsRow/index.tsx";
import { type MonthTableProps, useMonthTable } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  caption: "Entradas e saídas por mês",
  mes: "Mês",
  entradas: "Entradas",
  saidas: "Saídas",
  saldo: "Saldo",
  lanc: "Lanç.",
} as const;

export function MonthTable(props: MonthTableProps) {
  const { rows, totals } = useMonthTable(props);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>{COPY.caption}</caption>
        <thead>
          <tr>
            <th scope="col">{COPY.mes}</th>
            <th scope="col">{COPY.entradas}</th>
            <th scope="col">{COPY.saidas}</th>
            <th scope="col">{COPY.saldo}</th>
            <th scope="col">{COPY.lanc}</th>
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
