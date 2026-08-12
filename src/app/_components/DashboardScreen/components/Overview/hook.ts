import type { BoardData } from "../Board/hook.ts";

export interface OverviewProps {
  data: BoardData;
}

export function useOverview({ data }: OverviewProps) {
  return {
    data,
    // The series each KPI card draws. Saldo gets `cumulative`, not `balance`:
    // the card's headline is the running balance, and a sparkline of the
    // per-month delta would tell a different story from the number above it.
    income: data.points.map((point) => point.income),
    expense: data.points.map((point) => point.expense),
    balance: data.points.map((point) => point.cumulative),
  };
}
