import { Target } from "lucide-react";
import { type GoalRowProps, useGoalRow } from "./hook.ts";
import styles from "./style.module.scss";

export function GoalRow(props: GoalRowProps) {
  const { name, target, metrics } = useGoalRow(props);

  // No heading any more: the goals are rows of one table now, and the column
  // header SavingsSection draws above them is what titles the figures. The name
  // and the target carry `data-cell` instead — goals.spec reaches a row through
  // those, and a CSS-module class is a hashed name, not a contract.
  return (
    <li className={styles.row}>
      <div className={styles.head}>
        <Target size={16} aria-hidden={true} className={styles.icon} />
        <span data-cell="name" className={styles.name}>
          {name}
        </span>
        <span data-cell="target" className={styles.target}>
          {target}
        </span>
      </div>

      {/* The label is `display: none` from `lg` up, where the column header says
          the same word once for the whole table. The bar restates the months
          already written beside it, so it is the only part here that says
          nothing on its own and needs no second announcement — a plain <div>,
          never a <dt> or a <dd>: goals.spec reads the labels and values as
          paired lists. */}
      <dl className={styles.metrics}>
        {metrics.map((metric) => (
          <div key={metric.key} className={styles.metric}>
            <dt className={styles.label}>{metric.label}</dt>
            <dd className={styles.value}>{metric.value}</dd>
            {metric.bar ? (
              <div className={styles.track} aria-hidden={true}>
                <div
                  className={styles.fill}
                  style={{
                    width: metric.bar.width,
                    background: metric.bar.color,
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </dl>
    </li>
  );
}
