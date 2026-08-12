import { type AccountLineProps, useAccountLine } from "./hook.ts";
import styles from "./style.module.scss";

export function AccountLine(props: AccountLineProps) {
  const { text } = useAccountLine(props);

  return <li className={styles.line}>{text}</li>;
}
