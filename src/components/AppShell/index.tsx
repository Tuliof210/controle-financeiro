"use client";

import type { ReactNode } from "react";
import { Aside } from "./components/Aside";
import { Header } from "./components/Header";
import { useAppShell } from "./hook";
import styles from "./style.module.scss";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { open, toggle } = useAppShell();

  return (
    <div className={styles.shell}>
      <Header sidebarOpen={open} onToggleSidebar={toggle} />
      <Aside open={open} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
