import { type MeterRowProps, useMeterRow } from "./hook";
import styles from "./style.module.scss";

export function MeterRow(props: MeterRowProps) {
  const { label, tone, srLabel, children, projected, fill } =
    useMeterRow(props);

  return (
    <li className={styles.row}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.figures}>{children}</span>
      </div>
      {/* role="img" stays on the element carrying aria-label. Moving the label
          down to .fill would make screen readers announce nothing. */}
      <div
        className={styles.track}
        role="img"
        aria-label={srLabel}
        title={srLabel}
      >
        <div
          className={`${styles.fill} ${styles[tone]} ${projected ? styles.projected : ""}`}
          style={{ width: fill }}
        />
      </div>
    </li>
  );
}
