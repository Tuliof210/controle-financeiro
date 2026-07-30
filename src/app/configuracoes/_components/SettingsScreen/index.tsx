"use client";

import { PageHeader } from "@/components/PageHeader";
import { GoalsSection } from "./components/GoalsSection";
import { PeopleSection } from "./components/PeopleSection";
import { useSettingsScreen } from "./hook";
import styles from "./style.module.scss";

export function SettingsScreen() {
  const header = useSettingsScreen();

  return (
    <div className={styles.screen}>
      <PageHeader {...header} />
      <div className={styles.grid}>
        <PeopleSection />
        <GoalsSection />
      </div>
    </div>
  );
}
