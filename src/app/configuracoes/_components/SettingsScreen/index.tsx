"use client";

import { PageHeader } from "@/components/PageHeader/index.tsx";
import { GoalsSection } from "./components/GoalsSection/index.tsx";
import { PeopleSection } from "./components/PeopleSection/index.tsx";
import { SpendingGoalSection } from "./components/SpendingGoalSection/index.tsx";
import { useSettingsScreen } from "./hook.ts";
import styles from "./style.module.scss";

export function SettingsScreen() {
  const header = useSettingsScreen();

  return (
    <div className={styles.screen}>
      <PageHeader {...header} />
      <div className={styles.stack}>
        <PeopleSection />
        <GoalsSection />
        <SpendingGoalSection />
      </div>
    </div>
  );
}
