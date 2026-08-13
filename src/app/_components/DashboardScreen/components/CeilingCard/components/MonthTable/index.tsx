import { MINUS_GLYPH } from "@/lib/glyphs.ts";
import { type MonthTableProps, useMonthTable } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  saldoAcum: "Saldo acum.",
  tetoDoMes: "Teto do mês",
  sobra: "Sobra",
  atual: "Atual",
  saldoAcumuladoMes: "Saldo acumulado mês a mês, se cada mês gastar o seu teto",
  mes: "Mês",
} as const;

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
        <caption className={styles.caption}>{COPY.saldoAcumuladoMes}</caption>
        <thead className={styles.head}>
          <tr>
            <th scope="col" className={styles.month}>
              {COPY.mes}
            </th>
            <th scope="col">{COPY.saldoAcum}</th>
            <th scope="col">{COPY.tetoDoMes}</th>
            <th scope="col">{COPY.sobra}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className={styles.row} style={row.style}>
              <th scope="row" className={styles.month}>
                {row.label}
                {Boolean(row.isCurrent) && (
                  <span className={styles.current}>{COPY.atual}</span>
                )}
              </th>
              <td className={styles.balance} data-label="Saldo acum.">
                {row.balance}
              </td>
              {/* The minus is presentational: this column is always subtracted
                  from the balance beside it, and formatMoney never signs a
                  positive. */}
              <td className={styles.spend} data-label="Teto do mês">
                <span aria-hidden={true}>{MINUS_GLYPH}</span>
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
