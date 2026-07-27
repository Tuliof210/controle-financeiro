import { type RangeTimelineProps, useRangeTimeline } from "./hook";
import styles from "./style.module.scss";

export function RangeTimeline(props: RangeTimelineProps) {
  const { ticks, caption, srLabel } = useRangeTimeline(props);

  // An inverted range has no months to draw; a caption reading
  // "0 meses · 0 realizados" is worse than nothing.
  return ticks.length === 0 ? null : (
    <div>
      <div className={styles.timeline} role="img" aria-label={srLabel}>
        {ticks.map(({ month, done }) => (
          <span
            key={month}
            className={`${styles.tick} ${done ? styles.done : styles.todo}`}
          />
        ))}
      </div>
      <p className={styles.caption}>{caption}</p>
    </div>
  );
}
