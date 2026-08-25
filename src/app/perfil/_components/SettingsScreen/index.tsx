"use client";

import { Button } from "@/components/Button/index.tsx";
import { PageHeader } from "@/components/PageHeader/index.tsx";
import { onSubmitForm } from "@/lib/form.helper.ts";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { CeilingSection } from "./components/CeilingSection/index.tsx";
import { GoalsLimitSection } from "./components/GoalsLimitSection/index.tsx";
import { GoalsSection } from "./components/GoalsSection/index.tsx";
import { PeopleSection } from "./components/PeopleSection/index.tsx";
import { SimulatedSection } from "./components/SimulatedSection/index.tsx";
import { useSettingsScreen } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  salvar: "Salvar",
} as const;

export function SettingsScreen() {
  const view = useSettingsScreen();

  return (
    <div className={styles.screen}>
      <PageHeader {...view.header} />
      <div className={styles.stack}>
        {/* These two talk to their own endpoints, so they still fetch and save
            themselves. The three below share one all-or-nothing PUT. */}
        <PeopleSection />
        <GoalsSection />
        <form className={styles.form} onSubmit={onSubmitForm(view.onSave)}>
          <CeilingSection {...view.ceiling} />
          <GoalsLimitSection {...view.goalsLimit} />
          <SimulatedSection {...view.simulated} />
          {Boolean(view.error) && (
            <p className={styles.error} role="alert">
              <span aria-hidden={true}>{ERROR_GLYPH}</span> {view.error}
            </p>
          )}
          <Button type="submit" disabled={!view.dirty}>
            {COPY.salvar}
          </Button>
          {/* Always rendered, empty until a save lands: a live region announces
              a text change, not its own insertion. */}
          <p className={styles.saved} role="status">
            {view.savedMessage}
          </p>
        </form>
      </div>
    </div>
  );
}
