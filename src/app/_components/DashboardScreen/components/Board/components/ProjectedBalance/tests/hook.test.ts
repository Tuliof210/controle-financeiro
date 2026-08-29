import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useProjectedBalance } from "@/app/_components/DashboardScreen/components/Board/components/ProjectedBalance/hook.ts";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

const data = (points: MonthPoint[], current = 202_601) =>
  ({
    points,
    range: { start: 202_601, end: 202_603, current },
  }) as BoardData;

const figures = (payload: BoardData) =>
  renderHook(() => useProjectedBalance({ data: payload })).result.current
    .figures;

describe("useProjectedBalance", () => {
  it("renders no figure for a payload with no month in it", () => {
    expect(figures(data([]))).toBeNull();
  });

  it("reads the projection's end against the current month", () => {
    const points = [point(202_601, 100), point(202_603, 500)];

    expect(figures(data(points))).toMatchObject({
      endLabel: "Mar/26",
      value: 500,
      now: "R$ 1,00",
      delta: 400,
    });
  });

  it("points the glyph down when the projection loses ground", () => {
    expect(
      figures(data([point(202_601, 500), point(202_603, 100)])),
    ).toMatchObject({ delta: -400 });
  });

  it("falls back to the first point when the clock is outside the range", () => {
    expect(
      figures(data([point(202_601, 100), point(202_603, 500)], 209_912))?.now,
    ).toBe("R$ 1,00");
  });
});
