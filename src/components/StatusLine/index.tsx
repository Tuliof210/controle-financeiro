"use client";

import { type StatusLineProps, useStatusLine } from "./hook.ts";
import styles from "./style.module.scss";

// One sentence reporting what just happened, announced once: the dashboard's
// "what changed since your last visit" and the entry screens' ceiling delta
// after a save. Both were the same <p> with the same five typography
// declarations copied into two style modules.
export function StatusLine(props: StatusLineProps) {
  const { children } = useStatusLine(props);

  return (
    <p className={styles.line} role="status">
      {children}
    </p>
  );
}
