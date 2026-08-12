import { formatMoney, formatMoneyShort } from "@/lib/money.ts";
import type { BoardData } from "../Board/hook.ts";

interface SavingsSectionProps {
  data: BoardData;
}

const captionFor = (pace: number): string => {
  if (pace) {
    return "25% da média dos tetos do período";
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
    capacity: formatMoney(pace),
    // `pace` is a quarter of the MEAN of the Teto de Gastos figures, so unlike
    // the flat rate it replaced the caption may point straight at that card —
    // the two now read off the same numbers, and the reader can check it.
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
