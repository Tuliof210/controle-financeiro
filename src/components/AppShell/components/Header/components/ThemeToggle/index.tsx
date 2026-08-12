"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeToggle } from "./hook.ts";
import styles from "./style.module.scss";

export function ThemeToggle() {
  const { theme, toggle } = useThemeToggle();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {theme === null ? (
        <span className={styles.slot} aria-hidden={true} />
      ) : theme === "dark" ? (
        <Sun size={20} aria-hidden={true} />
      ) : (
        <Moon size={20} aria-hidden={true} />
      )}
    </button>
  );
}
