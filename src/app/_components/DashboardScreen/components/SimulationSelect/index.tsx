"use client";

import { type SimulationSelectProps, useSimulationSelect } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  apenasDadosReais: "Apenas dados reais",
  incluirSimulacoes: "Incluir simulações",
} as const;

export function SimulationSelect(props: SimulationSelectProps) {
  const { value } = props;
  const { handleChange } = useSimulationSelect(props);

  return (
    // aria-label rather than a visible one: this route has no PageHeader to hang
    // a label off, and ProfileSelect — the other bare select in the app — labels
    // itself the same way.
    <select
      aria-label="Dados do dashboard"
      className={styles.select}
      value={value}
      onChange={handleChange}
    >
      <option value="real">{COPY.apenasDadosReais}</option>
      <option value="all">{COPY.incluirSimulacoes}</option>
    </select>
  );
}
