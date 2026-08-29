import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { useHeroBand } from "@/app/_components/DashboardScreen/components/HeroBand/hook.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

const data = (points: MonthPoint[], current = 202_601) =>
  ({
    points,
    range: { start: 202_601, end: 202_603, current },
  }) as BoardData;

const band = (payload?: BoardData, refreshing?: boolean) =>
  renderHook(() => useHeroBand({ data: payload, refreshing })).result.current;

describe("useHeroBand", () => {
  it("is not live until a payload lands, and not while one is in flight", () => {
    const points = [point(202_601, 100), point(202_603, 500)];

    expect(band().live).toBe(false);
    expect(band(data([])).live).toBe(false);
    expect(band(data(points), true).live).toBe(false);
    expect(band(data(points)).live).toBe(true);
  });
});
