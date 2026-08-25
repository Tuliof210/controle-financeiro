"use client";

import { Button } from "@/components/Button/index.tsx";
import { PageHeader } from "@/components/PageHeader/index.tsx";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { CeilingSection } from "./components/CeilingSection/index.tsx";
import { GoalsLimitSection } from "./components/GoalsLimitSection/index.tsx";
import { GoalsSection } from "./components/GoalsSection/index.tsx";
import { PeopleSection } from "./components/PeopleSection/index.tsx";
import { SimulatedSection } from "./components/SimulatedSection/index.tsx";
import { useSettingsScreen } from "./hook.ts";
import { PREFS_COPY } from "./preferences-copy.ts";
import styles from "./style.module.scss";

export function SettingsScreen() {
  const view = useSettingsScreen();

  return (
    <div className={styles.screen}>
      <PageHeader {...view.header} />
      <div className={styles.stack}>
        <PeopleSection />
        <GoalsSection />
        {Boolean(view.loading) && (
          <p className={styles.loading}>{PREFS_COPY.loading}</p>
        )}
        {Boolean(view.ready) && (
          <>
            <CeilingSection {...view.ceiling} />
            <GoalsLimitSection {...view.goalsLimit} />
            <SimulatedSection {...view.simulated} />
          </>
        )}
        {Boolean(view.error) && (
          <div className={styles.fail}>
            <p className={styles.error} role="alert">
              <span aria-hidden={true}>{ERROR_GLYPH}</span> {view.error}
            </p>
            <Button
              variant="ghost"
              type="button"
              onClick={view.onRetry}
              loading={view.saving}
            >
              {PREFS_COPY.retry}
            </Button>
          </div>
        )}
        <p className={styles[view.statusClass]} role="status">
          {view.statusMessage}
        </p>
      </div>
    </div>
  );
}
