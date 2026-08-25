import { formatMoneyShort } from "@/lib/money.ts";
import type { BoardData } from "../Board/hook.ts";

interface SavingsSectionProps {
  data: BoardData;
}

// The figure itself is not repeated here on purpose: it is a Perfil adjustment
// now, and a caption that spells it out is a copy that ages every time the
// family changes it — which this one already did twice.
const captionFor = (pace: number): string => {
  if (pace) {
    return "conforme o ajuste de objetivos no Perfil";
  }
  return "sem teto de gastos no período";
};

function useSavingsSection({ data }: SavingsSectionProps) {
  const { goals, pace, ceiling } = data;

  return {
    goals,
    // What a goal row's bars are measured against: the months the projection
    // still has left. The same count the Teto card prints as "N meses
    // restantes", so a bar that fills means "lands after the period ends" and
    // the reader can check that claim one card up.
    horizon: ceiling.months.length,
    empty: goals.length === 0,
    capacity: pace,
    // `pace` comes off the goals adjustment saved in /perfil — a share of the
    // MEAN of the Teto de Gastos figures, or a flat amount — so the caption
    // points at where it was decided rather than restating the number.
    caption: captionFor(pace),
    // The divisor of metric B on every card below, so it is worth its own slot:
    // a reader comparing "EM PARALELO" against "DEDICADO" is looking for it.
    goalCount: String(goals.length),
    total: formatMoneyShort(
      goals.reduce((sum, goal) => sum + goal.targetCents, 0),
    ),
  };
}

export type { SavingsSectionProps };
export { useSavingsSection };
