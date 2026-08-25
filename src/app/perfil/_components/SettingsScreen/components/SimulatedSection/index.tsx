"use client";

import { SectionCard } from "@/components/SectionCard/index.tsx";
import { type SimulatedSectionProps, useSimulatedSection } from "./hook.ts";
import styles from "./style.module.scss";

const CHECKBOX_ID = "show-simulated";

const COPY = {
  ajuda:
    "Uma previsão marcada como simulada é um e-se: fica registrada como qualquer outra, mas o dashboard a ignora. Ligue aqui para que ela passe a contar nos números — saldo, teto e objetivos.",
  rotulo: "Contar previsões simuladas no dashboard",
} as const;

export function SimulatedSection(props: SimulatedSectionProps) {
  const { value, handleChange } = useSimulatedSection(props);

  return (
    <SectionCard title="Dados simulados">
      <p className={styles.help}>{COPY.ajuda}</p>
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
