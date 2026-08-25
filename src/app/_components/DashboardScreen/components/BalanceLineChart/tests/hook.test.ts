import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useBalanceLineChart } from "@/app/_components/DashboardScreen/components/BalanceLineChart/hook.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, income: 1000, expense: 400, cumulative }) as MonthPoint;

const points = [point(202_601, 100), point(202_602, 200), point(202_603, 300)];

const chart = (dashedFrom: number | null, tightest: number | null) =>
  renderHook(() =>
    useBalanceLineChart({
      points,
      dashedFrom,
      tightest,
      ceilingMonths: [],
      width: 884,
      height: 240,
    }),
  ).result.current;

describe("useBalanceLineChart", () => {
  it("draws one dot per month, titled with its own figure", () => {
    const { dots } = chart(null, null);

    expect(dots).toHaveLength(3);
    expect(dots[0].title).toBe("Jan/26 · acumulado R$ 1,00");
  });

  it("marks the dots from the projection month on", () => {
    const { dots } = chart(202_602, null);

    expect(dots.map((dot) => dot.projected)).toEqual([false, true, true]);
  });

  it("splits the line at the projection, sharing the boundary point", () => {
    const { solid, dashed } = chart(202_602, null);

    expect(solid).toHaveLength(2);
    expect(dashed).toHaveLength(2);
  });

  it("draws no zero line while the series never goes negative", () => {
    expect(chart(null, null).zeroY).toBeNull();
  });

  it("draws one once the balance crosses zero", () => {
    const { result } = renderHook(() =>
      useBalanceLineChart({
        points: [point(202_601, -100), point(202_602, 200)],
        dashedFrom: null,
        tightest: null,
        ceilingMonths: [],
        width: 884,
        height: 240,
      }),
    );

    expect(result.current.zeroY).not.toBeNull();
  });

  it("marks nothing when the ceiling names no bottleneck", () => {
    expect(chart(null, null).tightestMark).toBeNull();
  });

  it("anchors the mark on the named month's own balance", () => {
    const { tightestMark } = chart(null, 202_601);

    expect(tightestMark).toMatchObject({ flip: false });
    expect(tightestMark?.x).toBeGreaterThan(0);
  });

  it("flips the tag past the plot's midpoint", () => {
    expect(chart(null, 202_603).tightestMark?.flip).toBe(true);
  });

  it("marks nothing when the named month is not in the range", () => {
    expect(chart(null, 209_912).tightestMark).toBeNull();
  });
});
