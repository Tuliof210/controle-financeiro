import { type RowLayoutProps, useRowLayout } from "./hook";
import styles from "./style.module.scss";

// Owns only the row's internal composition (swatch / primary+secondary tiers
// / actions) and the breakpoint that stacks the tiers. Dividers, hover and
// spacing between rows stay on each caller's own <li> — EntryRow, PersonRow
// and GoalRow disagree on that (gap vs. border-run), the layout below doesn't.
export function RowLayout(props: RowLayoutProps) {
  const { swatch, primary, secondary, actions } = useRowLayout(props);

  return (
    <div className={styles.row}>
      {swatch}
      <div className={styles.content}>
        <div className={styles.primary}>{primary}</div>
        {secondary ? <div className={styles.secondary}>{secondary}</div> : null}
      </div>
      <div className={styles.actions}>{actions}</div>
    </div>
  );
}
