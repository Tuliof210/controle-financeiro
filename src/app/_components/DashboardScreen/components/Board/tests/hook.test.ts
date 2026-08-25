import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { useBoard } from "@/app/_components/DashboardScreen/components/Board/hook.ts";

const data = {
  status: "ok",
  range: { start: 202_601, end: 202_612, current: 202_608 },
  ceiling: { monthly: 100 },
} as BoardData;

describe("useBoard", () => {
  it("lifts the ceiling and the current month out of the payload", () => {
    const { result } = renderHook(() => useBoard({ data }));

    expect(result.current).toEqual({
      data,
      ceiling: data.ceiling,
      current: 202_608,
    });
  });
});
