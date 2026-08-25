"use client";

import { SectionCard } from "@/components/SectionCard/index.tsx";
import { type SimulatedSectionProps, useSimulatedSection } from "./hook.ts";
import styles from "./style.module.scss";

const CHECKBOX_ID = "show-simulated";

const COPY = {
  title: "Dados simulados",
  hint: "Uma previsão simulada é um e-se: fica registrada, mas o dashboard a ignora até você ligar isto.",
  rotulo: "Contar previsões simuladas no dashboard",
} as const;

export function SimulatedSection(props: SimulatedSectionProps) {
  const { value, handleChange } = useSimulatedSection(props);

  return (
    <SectionCard title={COPY.title} hint={COPY.hint}>
      <div className={styles.row}>
        <input
          id={CHECKBOX_ID}
          className={styles.checkbox}
          type="checkbox"
          checked={value}
          onChange={handleChange}
        />
        <label htmlFor={CHECKBOX_ID} className={styles.label}>
          {COPY.rotulo}
        </label>
      </div>
    </SectionCard>
  );
}
