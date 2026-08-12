"use client";

import { Moon, Sun } from "lucide-react";
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
      {icon === "sun" && <Sun size={ICON_SIZE} aria-hidden={true} />}
      {icon === "moon" && <Moon size={ICON_SIZE} aria-hidden={true} />}
    </button>
  );
}
