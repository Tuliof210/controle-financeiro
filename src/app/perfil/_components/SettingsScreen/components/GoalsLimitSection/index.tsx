"use client";

import { Field } from "@/components/Field/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { ModeToggle } from "../ModeToggle/index.tsx";
import { type GoalsLimitSectionProps, useGoalsLimitSection } from "./hook.ts";
import styles from "./style.module.scss";

const PERCENT_ID = "goals-percent";
const CENTS_ID = "goals-cents";
const PERCENT_MAX_LENGTH = 3;

const COPY = {
  ajuda:
    "Quanto do teto de gastos fica reservado para os objetivos. É esse número que define o ritmo com que o dashboard projeta cada objetivo: quanto maior, mais cedo eles fecham — e menos sobra para o mês.",
  como: "Em porcentagem, é essa fatia do teto, de 0 a 100%. Em valor fixo, é esse valor por mês.",
  legenda: "Como definir o limite",
  porcentagem: "Porcentagem do teto",
  valorFixo: "Limite mensal",
  dica: "De 0 a 100.",
} as const;

export function GoalsLimitSection(props: GoalsLimitSectionProps) {
  const view = useGoalsLimitSection(props);

  return (
    <SectionCard title="Limite em objetivos">
      <p className={styles.help}>{COPY.ajuda}</p>
      <p className={styles.help}>{COPY.como}</p>
      <ModeToggle
        name="goals-mode"
        legend={COPY.legenda}
        value={view.mode}
        onChange={view.onModeChange}
      />
      {Boolean(view.isPercent) && (
        <Field
          id={PERCENT_ID}
          label={COPY.porcentagem}
          value={view.percentValue}
          hint={COPY.dica}
          maxLength={PERCENT_MAX_LENGTH}
          onChange={view.onPercentChange}
        />
      )}
      {!view.isPercent && (
        <Field
          money={true}
          id={CENTS_ID}
          label={COPY.valorFixo}
          value={view.cents}
          hint={view.maxHint}
          onChange={view.onCentsChange}
        />
      )}
    </SectionCard>
  );
}
