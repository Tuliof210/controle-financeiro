"use client";

import { Field } from "@/components/Field/index.tsx";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { ModeToggle } from "../ModeToggle/index.tsx";
import { type CeilingSectionProps, useCeilingSection } from "./hook.ts";
import styles from "./style.module.scss";

const PERCENT_ID = "ceiling-percent";
const CENTS_ID = "ceiling-cents";
const PERCENT_MAX_LENGTH = 3;

const COPY = {
  title: "Teto de gastos",
  hint: "Quanto ainda dá para gastar neste mês sem nenhum mês futuro fechar no vermelho. Porcentagem é uma fatia do saldo disponível; valor fixo é esse valor, limitado ao que o período aguenta.",
  legenda: "Como definir o teto",
  porcentagem: "Porcentagem do saldo disponível",
  valorFixo: "Teto mensal",
  dica: "De 0 a 100.",
  esteMes: "este mês",
} as const;

export function CeilingSection(props: CeilingSectionProps) {
  const view = useCeilingSection(props);

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
          name="ceiling-mode"
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
