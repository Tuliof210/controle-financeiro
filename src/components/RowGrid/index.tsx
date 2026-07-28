import { type RowGridProps, useRowGrid } from "./hook";
import styles from "./style.module.scss";

// The LIST owns the columns, not the row: the `<ul>` declares the track set
// once and every `<li>` resolves against it (subgrid), so names start at one
// x and amounts end at another all the way down. Each `<li>` stays a real box
// — callers keep painting their own hover background and divider on it.
export function RowGrid(props: RowGridProps) {
  const { children } = useRowGrid(props);

  return <ul className={styles.list}>{children}</ul>;
}
