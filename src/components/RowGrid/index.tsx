import { type RowGridProps, useRowGrid } from "./hook.ts";
import styles from "./style.module.scss";

// The LIST owns the row's box and decides when it collapses; the ROW owns its
// own tracks. Sibling rows share no columns — the design puts owner and period
// on a line under the name, so nothing is left to line up across rows — and a
// caller paints nothing itself: padding, divider, hover and button size all
// live in style.module.scss, which is what keeps four lists looking alike.
export function RowGrid(props: RowGridProps) {
  const { children } = useRowGrid(props);

  return <ul className={styles.list}>{children}</ul>;
}
