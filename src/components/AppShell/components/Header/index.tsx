"use client";

import { Menu } from "lucide-react";
import { BrandMark } from "../BrandMark";
import { Avatar } from "./components/Avatar";
import { ProfileSelect } from "./components/ProfileSelect";
import { ThemeToggle } from "./components/ThemeToggle";
import { useHeader } from "./hook";
import styles from "./style.module.scss";

type HeaderProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function Header(props: HeaderProps) {
  const { greeting, today, sidebarExpanded, onToggleSidebar } =
    useHeader(props);

  return (
    <header className={styles.header}>
      {/* The hamburger collapses the rail, which does not exist below the
          `rail` breakpoint (src/styles/_theme.scss) — so it only shows from
          there up, and the brand mark stands in its place below it. */}
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
      <span className={styles.mark}>
        <BrandMark />
      </span>

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
