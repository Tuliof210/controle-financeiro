import { type MeterListProps, useMeterList } from "./hook";
import styles from "./style.module.scss";

// The <ul> the three meter cards share. Extracted for the same reason MeterRow
// was: it was byte-identical in each of them.
export function MeterList(props: MeterListProps) {
  const { children } = useMeterList(props);
  return <ul className={styles.list}>{children}</ul>;
}
