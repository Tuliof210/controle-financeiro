"use client";

import { Field } from "@/components/Field/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { ModeToggle } from "../ModeToggle/index.tsx";
import { type GoalsLimitSectionProps, useGoalsLimitSection } from "./hook.ts";
import styles from "./style.module.scss";

const PERCENT_ID = "goals-percent";
const CENTS_ID = "goals-cents";
const PERCENT_MAX_LENGTH = 3;

const COPY = {
  title: "Limite em objetivos",
  hint: "Quanto do teto fica reservado aos objetivos: quanto maior, eles fecham mais cedo e sobra menos para o mês.",
  legenda: "Como definir o limite",
  porcentagem: "Porcentagem do teto",
  valorFixo: "Limite mensal",
  dica: "De 0 a 100.",
  esteMes: "este mês",
} as const;

export function GoalsLimitSection(props: GoalsLimitSectionProps) {
  const view = useGoalsLimitSection(props);

  return (
    <SectionCard title={COPY.title} hint={COPY.hint}>
      <div className={styles.stack}>
        <p className={styles.lede}>{view.lede}</p>
        {Boolean(view.showFigure) && (
          <p className={styles.figure}>
            <MoneyDisplay value={view.figureCents} variant="large" />
            <span className={styles.unit}>{COPY.esteMes}</span>
          </p>
        )}
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
        {Boolean(!view.isPercent) && (
          <Field
            money={true}
            id={CENTS_ID}
            label={COPY.valorFixo}
            value={view.cents}
            hint={view.maxHint}
            onChange={view.onCentsChange}
          />
        )}
      </div>
    </SectionCard>
  );
}
