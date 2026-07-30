import { type MeterRowProps, useMeterRow } from "./hook";
import styles from "./style.module.scss";

export function MeterRow(props: MeterRowProps) {
  const {
    label,
    tone,
    srLabel,
    children,
    projected,
    current,
    fill,
    mark,
    markLabel,
  } = useMeterRow(props);

  return (
    <li className={styles.row}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        {current ? <span className={styles.now}>Atual</span> : null}
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
        {/* First child, and it has to stay first — the ceiling spec measures the
            fill as the track's first <div>. */}
        <div
          className={`${styles.fill} ${styles[tone]} ${projected ? styles.projected : ""}`}
          style={{ width: fill }}
        />
        {mark ? (
          <div
            className={styles.avg}
            style={{ left: mark }}
            title={markLabel}
          />
        ) : null}
      </div>
    </li>
  );
}
