import { ScenarioCells } from "./components/ScenarioCells";
import { type MonthTableProps, useMonthTable } from "./hook";
import styles from "./style.module.scss";

// Six figures per month is a grid, not a chart — which is why the bars this
// replaced are gone. A native <table> with no ARIA on it: Biome rejects explicit
// roles here as redundant, and it is right for as long as the table is a table.
//
// Below the container query's threshold the row stacks, which needs
// `display: block` and so gives up the implicit table roles. What replaces them
// is not ARIA but the per-cell `data-label`, printed by a `::before` that lands
// in the accessibility tree as text — so each figure reads "Saldo acum. (teto)
// R$ 12.385,14" on its own, with no column to belong to. The <thead> is clipped
// rather than hidden for the same reason.
export function MonthTable(props: MonthTableProps) {
  const { rows } = useMonthTable(props);

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>
          Saldo acumulado mês a mês sob duas hipóteses de gasto
        </caption>
        <thead className={styles.head}>
          <tr>
            <td />
            <th className={styles.group} colSpan={3} scope="colgroup">
              <span className={`${styles.dot} ${styles.toCeiling}`} />
              Se cada mês gastar o teto
            </th>
            <th className={styles.group} colSpan={3} scope="colgroup">
              <span className={`${styles.dot} ${styles.toAverage}`} />
              Se cada mês gastar a média
            </th>
          </tr>
          {/* Four of the six headers read identically and are told apart only by
              the group row above, which is not a programmatic association — the
              aria-label is. */}
          <tr>
            <th scope="col" className={styles.month}>
              Mês
            </th>
            <th scope="col" aria-label="Saldo acum. (teto)">
              Saldo acum.
            </th>
            <th scope="col">Teto do mês</th>
            <th scope="col" aria-label="Sobra (teto)">
              Sobra
            </th>
            <th scope="col" aria-label="Saldo acum. (média)">
              Saldo acum.
            </th>
            <th scope="col">Média</th>
            <th scope="col" aria-label="Sobra (média)">
              Sobra
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className={styles.month}>
                {row.label}
                {row.isCurrent ? (
                  <span className={styles.current}>Atual</span>
                ) : null}
              </th>
              <ScenarioCells
                {...row.ceiling}
                spendLabel="Teto do mês"
                blockLabel="teto"
              />
              <ScenarioCells
                {...row.average}
                spendLabel="Média"
                blockLabel="média"
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
