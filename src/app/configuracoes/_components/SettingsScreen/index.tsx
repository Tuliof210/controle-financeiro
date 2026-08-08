"use client";

import { PageHeader } from "@/components/PageHeader";
import { GoalsSection } from "./components/GoalsSection";
import { PeopleSection } from "./components/PeopleSection";
import { SpendingGoalSection } from "./components/SpendingGoalSection";
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
        <SpendingGoalSection />
      </div>
    </div>
  );
}
