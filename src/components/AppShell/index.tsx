"use client";

import type { ReactNode } from "react";
import { ProfileProvider } from "@/components/ProfileProvider";
import { Aside } from "./components/Aside";
import { BottomNav } from "./components/BottomNav";
import { Header } from "./components/Header";
import { useAppShell } from "./hook";
import styles from "./style.module.scss";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { collapsed, toggle } = useAppShell();

  return (
    <ProfileProvider>
      <div className={styles.shell}>
        <Header sidebarCollapsed={collapsed} onToggleSidebar={toggle} />
        <Aside collapsed={collapsed} onToggle={toggle} />
        <main className={styles.main}>
          <div className={styles.page}>{children}</div>
        </main>
        <BottomNav />
      </div>
    </ProfileProvider>
  );
}
