import { type MonthTableProps, useMonthTable } from "./hook";
import styles from "./style.module.scss";

// Three figures per month is a grid, not a chart — which is why the bars this
// replaced are gone. A native <table> with no ARIA on it: Biome rejects explicit
// roles here as redundant, and it is right for as long as the table is a table.
//
// Below the container query's threshold the row stacks, which needs
// `display: block` and so gives up the implicit table roles. What replaces them
// is not ARIA but the per-cell `data-label`, printed by a `::before` that lands
// in the accessibility tree as text — so each figure reads "Saldo acum.
// R$ 12.385,14" on its own, with no column to belong to. The <thead> is clipped
// rather than hidden for the same reason.
//
// The cells are written out here rather than in a child component: one spending
// hypothesis renders them once, and ARCHITECTURE only asks for a child when a
// structure repeats.
export function MonthTable(props: MonthTableProps) {
  const { rows } = useMonthTable(props);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          Saldo acumulado mês a mês, se cada mês gastar o seu teto
        </caption>
        <thead className={styles.head}>
          <tr>
            <th scope="col" className={styles.month}>
              Mês
            </th>
            <th scope="col">Saldo acum.</th>
            <th scope="col">Teto do mês</th>
            <th scope="col">Sobra</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={styles.row} style={row.style}>
              <th scope="row" className={styles.month}>
                {row.label}
                {row.isCurrent ? (
                  <span className={styles.current}>Atual</span>
                ) : null}
              </th>
              <td className={styles.balance} data-label="Saldo acum.">
                {row.balance}
              </td>
              {/* The minus is presentational: this column is always subtracted
                  from the balance beside it, and formatMoney never signs a
                  positive. */}
              <td className={styles.spend} data-label="Teto do mês">
                <span aria-hidden>−</span>
                {row.spend}
              </td>
              <td className={styles.left} data-label="Sobra">
                {row.left}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
