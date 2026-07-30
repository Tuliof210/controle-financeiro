import { formatMoney, formatMoneyShort } from "@/lib/money";
import type { BoardData } from "../Board/hook";

export type SavingsSectionProps = { data: BoardData };

export function useSavingsSection({ data }: SavingsSectionProps) {
  const { goals, pace } = data;

  return {
    goals,
    empty: goals.length === 0,
    capacity: formatMoney(pace),
    // `pace` is a quarter of the MEAN of the Teto de Gastos figures, so unlike
    // the flat rate it replaced the caption may point straight at that card —
    // the two now read off the same numbers, and the reader can check it.
    caption: pace
      ? "25% da média dos tetos do período"
      : "sem teto de gastos no período",
    // The divisor of metric B on every card below, so it is worth its own slot:
    // a reader comparing "EM PARALELO" against "DEDICADO" is looking for it.
    goalCount: String(goals.length),
    total: formatMoneyShort(
      goals.reduce((sum, goal) => sum + goal.targetCents, 0),
    ),
  };
}
