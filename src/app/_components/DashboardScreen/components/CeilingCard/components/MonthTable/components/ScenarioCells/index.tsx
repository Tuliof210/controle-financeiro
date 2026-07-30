import { type ScenarioCellsProps, useScenarioCells } from "./hook";
import styles from "./style.module.scss";

// Three <td>s in a fragment, so the row stays one <tr> and the table keeps its
// column model. Rendered twice per month — the two scenarios differ in their
// numbers and in two labels, never in their shape.
export function ScenarioCells(props: ScenarioCellsProps) {
  const {
    balance,
    balanceLabel,
    spend,
    spendLabel,
    left,
    leftLabel,
    negative,
  } = useScenarioCells(props);

  return (
    <>
      <td className={styles.balance} data-label={balanceLabel}>
        {balance}
      </td>
      {/* The minus is presentational: this column is always subtracted from the
          balance beside it, and formatMoney never signs a positive. */}
      <td className={styles.spend} data-label={spendLabel}>
        <span aria-hidden>−</span>
        {spend}
      </td>
      <td
        className={negative ? styles.negative : styles.left}
        data-label={leftLabel}
      >
        {negative ? <span className={styles.mark} aria-hidden /> : null}
        {left}
      </td>
    </>
  );
}
