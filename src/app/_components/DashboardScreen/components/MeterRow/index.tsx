import { type MeterRowProps, useMeterRow } from "./hook";
import styles from "./style.module.scss";

export function MeterRow(props: MeterRowProps) {
  const { label, tone, srLabel, children, footer, fill } = useMeterRow(props);

  return (
    <li className={styles.row}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.figures}>{children}</span>
      </div>
      <div
        className={styles.track}
        role="img"
        aria-label={srLabel}
        title={srLabel}
      >
        <div
          className={`${styles.fill} ${styles[tone]}`}
          style={{ width: fill }}
        />
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </li>
  );
}
