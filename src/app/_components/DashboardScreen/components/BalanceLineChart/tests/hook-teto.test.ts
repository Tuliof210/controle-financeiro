import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useBalanceLineChart } from "@/app/_components/DashboardScreen/components/BalanceLineChart/hook.ts";
import type { CeilingMonth } from "@/app/api/dashboard/ceiling.types.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, income: 1000, expense: 400, cumulative }) as MonthPoint;

const teto = (
  month: number,
  ceilingLeft: number,
  budget = 100,
): CeilingMonth => ({
  month,
  budget,
  ceilingBalance: ceilingLeft + budget,
  ceilingLeft,
});

const points = [
  point(202_601, 1000),
  point(202_602, 1000),
  point(202_603, 1000),
];

const chart = (ceilingMonths: CeilingMonth[]) =>
  renderHook(() =>
    useBalanceLineChart({
      points,
      dashedFrom: null,
      tightest: 202_602,
      ceilingMonths,
      width: 884,
      height: 240,
    }),
  ).result.current;

const tetoDots = (ceilingMonths: CeilingMonth[]) =>
  chart(ceilingMonths).dots.filter((dot) => String(dot.key).endsWith("-teto"));

describe("useBalanceLineChart teto series", () => {
  it("draws no teto series when ceilingMonths is empty", () => {
    expect(chart([]).teto).toEqual([]);
    expect(tetoDots([])).toHaveLength(0);
  });

  it("plots one teto point per ceiling month, none before the first", () => {
    const months = [teto(202_602, 400), teto(202_603, 200)];

    expect(chart(months).teto.map((row) => row.month)).toEqual([
      202_602, 202_603,
    ]);
    expect(tetoDots(months).map((dot) => dot.key)).toEqual([
      "202602-teto",
      "202603-teto",
    ]);
  });

  it("places each teto dot on its ceilingLeft", () => {
    const months = [teto(202_602, 400)];
    const { frame } = chart(months);

    expect(tetoDots(months)[0].cy).toBe(frame.valueScale(400));
  });

  it("coincides with the current series when budget is zero", () => {
    const months = [teto(202_602, 1000, 0)];
    const { dots } = chart(months);
    const current = dots.find((dot) => dot.key === "202602-cumulative");
    const spent = dots.find((dot) => dot.key === "202602-teto");

    expect(current?.cy).toBe(spent?.cy);
  });

  it("draws zero once only the teto series goes negative", () => {
    expect(chart([]).zeroY).toBeNull();
    expect(chart([teto(202_601, -200)]).zeroY).not.toBeNull();
  });

  it("anchors the bottleneck on cumulative, not ceilingLeft", () => {
    const { tightestMark, dots } = chart([teto(202_602, -800)]);
    const current = dots.find((dot) => dot.key === "202602-cumulative");

    expect(tightestMark?.y).toBe(current?.cy);
  });
});
