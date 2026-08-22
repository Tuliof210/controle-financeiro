"use client";

import { Icon } from "@/components/Icon/index.tsx";
import { useThemeToggle } from "./hook.ts";
import styles from "./style.module.scss";

const ICON_SIZE = 20;

export function ThemeToggle() {
  const { toggle, ariaLabel, icon } = useThemeToggle();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={ariaLabel}
    >
      {icon === "none" && <span className={styles.slot} aria-hidden={true} />}
      {icon === "sun" && <Icon name="sun" size={ICON_SIZE} />}
      {icon === "moon" && <Icon name="moon" size={ICON_SIZE} />}
    </button>
  );
}
