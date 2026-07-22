"use client";

import { GoalsSection } from "./components/GoalsSection";
import { MonthlyGoalSection } from "./components/MonthlyGoalSection";
import { PeopleSection } from "./components/PeopleSection";
import { RangeSection } from "./components/RangeSection";
import { useSettingsScreen } from "./hook";
import styles from "./style.module.scss";

export function SettingsScreen() {
  const { eyebrow } = useSettingsScreen();

  return (
    <div className={styles.screen}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <div className={styles.grid}>
        <PeopleSection />
        <RangeSection />
        <MonthlyGoalSection />
        <GoalsSection />
      </div>
    </div>
  );
}
