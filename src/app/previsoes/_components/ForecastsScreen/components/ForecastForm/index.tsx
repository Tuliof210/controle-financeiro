"use client";

import { EntryForm } from "@/components/EntryForm/index.tsx";
import { IntervalList } from "./components/IntervalList/index.tsx";
import { KindToggle } from "./components/KindToggle/index.tsx";
import { type ForecastFormProps, useForecastForm } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  simulacao: "Simulação",
  oDashboardSo:
    "O dashboard só soma simulações quando o ajuste do Perfil pedir.",
} as const;

const SIMULATED_ID = "forecast-simulated";

export function ForecastForm(props: ForecastFormProps) {
  const { error, submitLabel, people } = props;
  const {
    fields,
    intervals,
    updateInterval,
    addInterval,
    removeInterval,
    simulated,
    toggleSimulated,
    kind,
    setKind,
    localError,
    canSubmit,
    handleSubmit,
  } = useForecastForm(props);

  return (
    <EntryForm
      idPrefix="forecast"
      people={people}
      fields={fields}
      // EntryForm's `period` is the slot for whatever a forecast has and a
      // movement does not: intervals, kind, and the simulation switch.
      period={
        <div className={styles.period}>
          <IntervalList
            intervals={intervals}
            onUpdate={updateInterval}
            onAdd={addInterval}
            onRemove={removeInterval}
          />
          <KindToggle value={kind} onChange={setKind} />
          <div>
            <label className={styles.simulated} htmlFor={SIMULATED_ID}>
              <input
                type="checkbox"
                className={styles.checkbox}
                id={SIMULATED_ID}
                checked={simulated}
                onChange={toggleSimulated}
              />
              {COPY.simulacao}
            </label>
            <p className={styles.hint}>{COPY.oDashboardSo}</p>
          </div>
        </div>
      }
      error={localError ?? error}
      submitLabel={submitLabel}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
    />
  );
}
