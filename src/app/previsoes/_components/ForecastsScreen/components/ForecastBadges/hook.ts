import type { Forecast } from "@/core/entities/forecast.entity.ts";
import { type ForecastKind, KIND_LABELS } from "@/lib/forecast-kinds.ts";
import styles from "./style.module.scss";

const COPY = {
  simulado: "Simulado",
} as const;

type ForecastBadgesProps = Pick<Forecast, "kind" | "simulated">;

interface Badge {
  key: ForecastKind | "simulated";
  label: string;
  className: string;
}

// Kind first, simulated after when it is set. Both are labels, not projection
// inputs; the className is resolved here so index.tsx never concatenates.
function useForecastBadges({ kind, simulated }: ForecastBadgesProps) {
  const items: Badge[] = [
    {
      key: kind,
      label: KIND_LABELS[kind],
      className: `${styles.badge} ${styles[kind]}`,
    },
  ];
  if (simulated) {
    items.push({
      key: "simulated",
      label: COPY.simulado,
      className: `${styles.badge} ${styles.simulated}`,
    });
  }
  return { items };
}

export type { ForecastBadgesProps };
export { useForecastBadges };
