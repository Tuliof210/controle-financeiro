"use client";

import { type SimulationSelectProps, useSimulationSelect } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  dadosDoDashboard: "Dados do dashboard",
  apenasDadosReais: "Apenas dados reais",
  incluirSimulacoes: "Incluir simulações",
} as const;

export function SimulationSelect(props: SimulationSelectProps) {
  const { value } = props;
  const { id, handleChange } = useSimulationSelect(props);

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {COPY.dadosDoDashboard}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={handleChange}
      >
        <option value="real">{COPY.apenasDadosReais}</option>
        <option value="all">{COPY.incluirSimulacoes}</option>
      </select>
    </div>
  );
}
