import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { useBoard } from "@/app/_components/DashboardScreen/components/Board/hook.ts";

const data = {
  status: "ok",
  range: { start: 202_601, end: 202_612, current: 202_608 },
  ceiling: { monthly: 100 },
  meta: 700,
} as BoardData;

describe("useBoard", () => {
  it("lifts the ceiling, the goal and the current month out of the payload", () => {
    const onCapChange = jest.fn();
    const { result } = renderHook(() =>
      useBoard({ data, cap: "50", onCapChange }),
    );

    expect(result.current).toMatchObject({
      data,
      cap: "50",
      onCapChange,
      ceiling: data.ceiling,
      meta: 700,
      current: 202_608,
    });
  });
});
