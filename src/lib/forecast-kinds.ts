export const FORECAST_KINDS = ["fixed", "commitment"] as const;
export type ForecastKind = (typeof FORECAST_KINDS)[number];
export const DEFAULT_FORECAST_KIND: ForecastKind = "fixed";
export const KIND_LABELS: Record<ForecastKind, string> = {
  fixed: "Fixa",
  commitment: "Compromisso futuro",
};
