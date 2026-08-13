import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { useOverview } from "@/app/_components/DashboardScreen/components/Overview/hook.ts";

const data = {
  points: [
    { income: 10, expense: 4, balance: 6, cumulative: 6 },
    { income: 20, expense: 5, balance: 15, cumulative: 21 },
  ],
} as BoardData;

describe("useOverview", () => {
  it("splits one series per KPI card", () => {
    const { result } = renderHook(() => useOverview({ data }));

    expect(result.current.income).toEqual([10, 20]);
    expect(result.current.expense).toEqual([4, 5]);
  });

  it("draws Saldo from the running balance, not the monthly delta", () => {
    const { result } = renderHook(() => useOverview({ data }));

    expect(result.current.balance).toEqual([6, 21]);
  });
});
