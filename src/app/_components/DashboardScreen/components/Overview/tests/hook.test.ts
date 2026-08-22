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
  it("builds the period facts from the month points", () => {
    const { result } = renderHook(() => useOverview({ data }));

    expect(result.current.facts).toHaveLength(3);
    expect(result.current.facts[0]).toMatchObject({ key: "income" });
  });
});
