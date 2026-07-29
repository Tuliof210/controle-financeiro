"use client";

import type { ReactNode } from "react";
import { ProfileProvider } from "@/components/ProfileProvider";
import { Aside } from "./components/Aside";
import { Header } from "./components/Header";
import { useAppShell } from "./hook";
import styles from "./style.module.scss";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { collapsed, drawerOpen, closeDrawer, expanded, toggle } =
    useAppShell();

  return (
    <ProfileProvider>
      <div className={styles.shell}>
        <Header sidebarExpanded={expanded} onToggleSidebar={toggle} />
        <Aside
          collapsed={collapsed}
          drawerOpen={drawerOpen}
          onToggle={toggle}
          onCloseDrawer={closeDrawer}
        />
        <main className={styles.main}>
          <div className={styles.page}>{children}</div>
        </main>
      </div>
    </ProfileProvider>
  );
}
