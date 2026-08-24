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
  it("passes the board data through for the charts", () => {
    const { result } = renderHook(() => useOverview({ data }));

    expect(result.current.data).toBe(data);
    expect(result.current).not.toHaveProperty("facts");
  });
});
