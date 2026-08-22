import type { Forecast } from "@/core/entities/forecast.entity.ts";
import { KIND_LABELS } from "@/lib/forecast-kinds.ts";

type ForecastBadgesProps = Pick<Forecast, "kind" | "simulated">;

function useForecastBadges({ kind, simulated }: ForecastBadgesProps) {
  return { kindLabel: KIND_LABELS[kind], simulated };
}

export type { ForecastBadgesProps };
export { useForecastBadges };
