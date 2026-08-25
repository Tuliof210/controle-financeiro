"use client";

import { Field } from "@/components/Field/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { ModeToggle } from "../ModeToggle/index.tsx";
import { type CeilingSectionProps, useCeilingSection } from "./hook.ts";
import styles from "./style.module.scss";

const PERCENT_ID = "ceiling-percent";
const CENTS_ID = "ceiling-cents";
const PERCENT_MAX_LENGTH = 3;

const COPY = {
  ajuda:
    "O teto é quanto ainda dá para gastar num mês sem nenhum mês futuro fechar no vermelho. Ele parte do saldo que sobra até o fim do período e é acumulado: o que este mês não gastar continua disponível nos seguintes.",
  como: "Em porcentagem, o teto é essa fatia do saldo disponível do mês. Em valor fixo, é esse valor — limitado ao que o período aguenta.",
  legenda: "Como definir o teto",
  porcentagem: "Porcentagem do saldo disponível",
  valorFixo: "Teto mensal",
  dica: "De 0 a 100.",
} as const;

export function CeilingSection(props: CeilingSectionProps) {
  const view = useCeilingSection(props);

  return (
    <SectionCard title="Teto de Gastos">
      <p className={styles.help}>{COPY.ajuda}</p>
      <p className={styles.help}>{COPY.como}</p>
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
