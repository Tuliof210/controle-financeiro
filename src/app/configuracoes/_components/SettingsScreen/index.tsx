"use client";

import { PageHeader } from "@/components/PageHeader";
import { GoalsSection } from "./components/GoalsSection";
import { MonthlyGoalSection } from "./components/MonthlyGoalSection";
import { PeopleSection } from "./components/PeopleSection";
import { RangeSection } from "./components/RangeSection";
import { useSettingsScreen } from "./hook";
import styles from "./style.module.scss";

export function SettingsScreen() {
  const header = useSettingsScreen();

  return (
    <div className={styles.screen}>
      <PageHeader {...header} />
      <div className={styles.grid}>
        <PeopleSection />
        <RangeSection />
        <MonthlyGoalSection />
        <GoalsSection />
      </div>
    </div>
  );
}
