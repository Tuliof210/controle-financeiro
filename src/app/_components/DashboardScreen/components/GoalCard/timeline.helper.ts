import type { GoalPace } from "@/app/api/dashboard/types";
import { formatYyyymm } from "@/lib/months";

// The one sentence a metric turns into: "~7 meses · Fev/27", or the words that
// replace it when there is no capacity to divide at all. Singularised the way
// the retired etaLabel was — "~1 meses" is not Portuguese.
//
// The month is never clamped to the end of the global period (owner's decision,
// 2026-07-30): a goal landing after the range still names the month it lands in,
// rather than the "ALÉM DO PERÍODO" this replaces.
export function paceLabel(pace: GoalPace): string {
  if (pace === null) return "ritmo zero";
  const { months, doneMonth } = pace;
  const unit = months === 1 ? "mês" : "meses";
  return `~${months} ${unit} · ${formatYyyymm(doneMonth)}`;
}
