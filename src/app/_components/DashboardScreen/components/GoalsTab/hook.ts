import { formatMoney, formatMoneyShort } from "@/lib/money";
import type { BoardData } from "../Board/hook";

export type GoalsTabProps = { data: BoardData };

export function useGoalsTab({ data }: GoalsTabProps) {
  const { goals, pace } = data;

  return {
    goals,
    empty: goals.length === 0,
    capacity: formatMoney(pace),
    // `pace` is floor(0.25 × ceiling.sustainable) — a share of the flat rate that
    // survives being saved every month, NOT of the front-loaded figure the Teto
    // de Gastos card displays. The caption must not name a percentage of that
    // figure: the two differ, and a user comparing the two tabs would be reading
    // a sentence their own screen contradicts.
    caption: pace
      ? "ritmo que o período sustenta todo mês"
      : "sem folga sustentável no período",
    // "COBERTAS NO PERÍODO", not "CONCLUÍDAS": doneMonth means the projected
    // ceiling funds the target before the range ends, which is not the same as
    // achieved. There is no achieved state in this data.
    covered: `${goals.filter((goal) => goal.doneMonth !== null).length} / ${goals.length}`,
    total: formatMoneyShort(
      goals.reduce((sum, goal) => sum + goal.targetCents, 0),
    ),
  };
}
