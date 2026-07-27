import { formatMoney, formatMoneyShort } from "@/lib/money";
import type { BoardData } from "../Board/hook";

export type GoalsTabProps = { data: BoardData };

export function useGoalsTab({ data }: GoalsTabProps) {
  const { goals, pace } = data;

  return {
    goals,
    empty: goals.length === 0,
    capacity: formatMoney(pace),
    // `pace` is floor(0.25 × min(slack.total)), so the caption is literally what
    // it is. At zero there is nothing to divide by and nothing to describe as a
    // share, so the sentence changes rather than the number.
    caption: pace
      ? "guardando 25% da menor folga do período"
      : "sem folga projetada no período",
    // "COBERTAS NO PERÍODO", not "CONCLUÍDAS": doneMonth means the projected
    // slack funds the target before the range ends, which is not the same as
    // achieved. There is no achieved state in this data.
    covered: `${goals.filter((goal) => goal.doneMonth !== null).length} / ${goals.length}`,
    total: formatMoneyShort(
      goals.reduce((sum, goal) => sum + goal.targetCents, 0),
    ),
  };
}
