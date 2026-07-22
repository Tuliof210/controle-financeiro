"use client";

import { useHeader } from "./hook";
import styles from "./style.module.scss";

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export function Header(props: HeaderProps) {
  const { greeting, sidebarOpen, onToggleSidebar } = useHeader(props);

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.toggle}
        aria-label="Alternar menu"
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
        onClick={onToggleSidebar}
      >
        ☰
      </button>
      <p className={styles.greeting}>{greeting}</p>
    </header>
  );
}
