import { type CoverageBarProps, useCoverageBar } from "./hook";
import styles from "./style.module.scss";

export function CoverageBar(props: CoverageBarProps) {
  const { label, segments, srLabel } = useCoverageBar(props);

  return (
    <span className={styles.wrap}>
      {segments ? (
        <span className={styles.track} role="img" aria-label={srLabel}>
          {segments.map(({ left, width }) => (
            <span key={left} className={styles.fill} style={{ left, width }} />
          ))}
        </span>
      ) : null}
      <span className={styles.range}>{label}</span>
    </span>
  );
}
