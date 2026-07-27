"use client";

import { useAvatar } from "./hook";
import styles from "./style.module.scss";

// Decorative only: the active profile is already announced by ProfileSelect's
// own label, and there is no menu behind this — hence aria-hidden, and not a
// button.
export function Avatar() {
  const { initials } = useAvatar();

  return (
    <span className={styles.avatar} aria-hidden>
      {initials}
    </span>
  );
}
