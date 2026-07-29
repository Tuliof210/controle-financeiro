"use client";

import { Menu } from "lucide-react";
import { Avatar } from "./components/Avatar";
import { ProfileSelect } from "./components/ProfileSelect";
import { ThemeToggle } from "./components/ThemeToggle";
import { useHeader } from "./hook";
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
