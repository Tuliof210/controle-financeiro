"use client";

import { Menu } from "lucide-react";
import { Avatar } from "./components/Avatar/index.tsx";
import { ProfileSelect } from "./components/ProfileSelect/index.tsx";
import { ThemeToggle } from "./components/ThemeToggle/index.tsx";
import { useHeader } from "./hook.ts";
import styles from "./style.module.scss";

type HeaderProps = {
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
};

export function Header(props: HeaderProps) {
  const { greeting, today, sidebarExpanded, onToggleSidebar } =
    useHeader(props);

  return (
    <header className={styles.header}>
      {/* Collapses the in-layout rail from `md` up, opens the overlay drawer
          below it — visible at every width. */}
      <button
        type="button"
        className={styles.toggle}
        aria-label="Alternar menu"
        aria-expanded={sidebarExpanded}
        aria-controls="app-sidebar"
        onClick={onToggleSidebar}
      >
        <Menu size={20} aria-hidden />
      </button>

      <div className={styles.greetingBlock}>
        <p className={styles.greeting}>{greeting}</p>
        <p className={styles.today}>{today}</p>
      </div>

      <ProfileSelect />
      <ThemeToggle />
      <Avatar />
    </header>
  );
}
