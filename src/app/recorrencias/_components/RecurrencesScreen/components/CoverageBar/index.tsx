import { type CoverageBarProps, useCoverageBar } from "./hook";
import styles from "./style.module.scss";

// The band alone. Its interval text used to sit right under it and now reads in
// the row's metadata line, so the bar is pure reinforcement of words already in
// the row: `aria-hidden`, with no `role="img"` and no label of its own. Keeping
// the label after its visible twin moved would make a screen reader announce
// the same intervals twice.
export function CoverageBar(props: CoverageBarProps) {
  const { segments } = useCoverageBar(props);

  return (
    <span className={styles.track} aria-hidden>
      {segments.map(({ left, width }) => (
        <span key={left} className={styles.fill} style={{ left, width }} />
      ))}
    </span>
  );
}
