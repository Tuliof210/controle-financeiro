import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { useSavingsSection } from "@/app/_components/DashboardScreen/components/SavingsSection/hook.ts";

const data = (goals: unknown[], pace: number) =>
  ({
    goals,
    pace,
    ceiling: { months: [{}, {}, {}] },
  }) as BoardData;

const goal = (targetCents: number) => ({ id: "g", name: "Casa", targetCents });

describe("useSavingsSection", () => {
  it("measures the goal bars against the months the period has left", () => {
    const { result } = renderHook(() =>
      useSavingsSection({ data: data([goal(1000)], 250) }),
    );

    expect(result.current.horizon).toBe(3);
  });

  it("points the caption at the card the pace comes from", () => {
    const { result } = renderHook(() =>
      useSavingsSection({ data: data([goal(1000)], 250) }),
    );

    expect(result.current.caption).toBe(
      "conforme o ajuste de objetivos em Ajustes",
    );
    expect(result.current.capacity).toBe(250);
  });

  it("says there is no ceiling when nothing can be put aside", () => {
    const { result } = renderHook(() =>
      useSavingsSection({ data: data([goal(1000)], 0) }),
    );

    expect(result.current.caption).toBe("sem teto de gastos no período");
  });

  it("counts and totals the goals", () => {
    const { result } = renderHook(() =>
      useSavingsSection({ data: data([goal(1000), goal(500)], 250) }),
    );

    expect(result.current.goalCount).toBe("2");
    expect(result.current.total).toBe("R$ 15");
    expect(result.current.empty).toBe(false);
  });

  it("reads an empty goal list as empty", () => {
    const { result } = renderHook(() =>
      useSavingsSection({ data: data([], 250) }),
    );

    expect(result.current.empty).toBe(true);
    expect(result.current.total).toBe("R$ 0");
  });
});
