import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useGoalRow } from "@/app/_components/DashboardScreen/components/GoalRow/hook.ts";
import type { GoalProjection } from "@/app/api/dashboard/types.ts";

const pace = (months: number, doneMonth: number) => ({ months, doneMonth });

const goal = (over: Partial<GoalProjection> = {}): GoalProjection => ({
  id: "g1",
  name: "Casa",
  targetCents: 150_000,
  dedicated: pace(3, 202_603),
  parallel: pace(6, 202_606),
  serialized: pace(12, 202_612),
  ...over,
});

describe("useGoalRow", () => {
  it("names the goal and shortens its target", () => {
    const { result } = renderHook(() =>
      useGoalRow({ goal: goal(), horizon: 12 }),
    );

    expect(result.current.name).toBe("Casa");
    expect(result.current.target).toBe("R$ 1.500");
  });

  it("reads the three funding assumptions in order", () => {
    const { result } = renderHook(() =>
      useGoalRow({ goal: goal(), horizon: 12 }),
    );

    expect(result.current.metrics.map((m) => m.label)).toEqual([
      "DEDICADO",
      "EM PARALELO",
      "UM DE CADA VEZ",
    ]);
  });

  it("prints a four-digit year, a goal may land past the century", () => {
    const { result } = renderHook(() =>
      useGoalRow({
        goal: goal({ dedicated: pace(200, 210_402) }),
        horizon: 12,
      }),
    );

    expect(result.current.metrics[0].value).toBe("~200 meses · Fev/2104");
  });

  it("singularises a one-month wait", () => {
    const { result } = renderHook(() =>
      useGoalRow({ goal: goal({ dedicated: pace(1, 202_601) }), horizon: 12 }),
    );

    expect(result.current.metrics[0].value).toBe("~1 mês · Jan/2026");
  });

  it("says there is no rate at all when the pace is zero", () => {
    const { result } = renderHook(() =>
      useGoalRow({ goal: goal({ dedicated: null }), horizon: 12 }),
    );

    expect(result.current.metrics[0]).toMatchObject({
      value: "ritmo zero",
      bar: null,
    });
  });

  it("measures each bar against the horizon, filling it past the end", () => {
    const { result } = renderHook(() =>
      useGoalRow({ goal: goal(), horizon: 6 }),
    );

    expect(result.current.metrics[0].bar).toEqual({
      color: "var(--color-brand)",
      width: "50%",
    });
    expect(result.current.metrics[2].bar?.width).toBe("100%");
  });

  it("draws no bar against an empty projection", () => {
    const { result } = renderHook(() =>
      useGoalRow({ goal: goal(), horizon: 0 }),
    );

    expect(result.current.metrics[0].bar).toBeNull();
  });
});
