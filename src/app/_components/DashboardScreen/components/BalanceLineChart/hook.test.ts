import { describe, expect, it } from "vitest";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { useBalanceLineChart } from "./hook";

// Pure like its sibling: no React hooks, so it runs under the node-environment
// Vitest config with no jsdom.
const point = (month: number, cumulative: number): MonthPoint => ({
  month,
  income: 0,
  expense: 0,
  balance: 0,
  cumulative,
  incomeEstimated: false,
  expenseEstimated: false,
  realIncome: 0,
  realExpense: 0,
  estimatedIncome: 0,
  estimatedExpense: 0,
});

const POINTS = [
  point(202601, 600000),
  point(202602, 1200000),
  point(202603, 1850000),
];

const run = (points: MonthPoint[], dashedFrom: number | null) =>
  useBalanceLineChart({ points, dashedFrom, width: 600, height: 260 });

describe("useBalanceLineChart", () => {
  it("flips dot opacity at the projection boundary", () => {
    const { dots } = run(POINTS, 202602);
    expect(dots.map((dot) => dot.projected)).toEqual([false, true, true]);
  });

  it("marks nothing as projected when the whole series is history", () => {
    expect(run(POINTS, null).dots.every((dot) => !dot.projected)).toBe(true);
  });

  it("shares the boundary point between the solid and dashed segments", () => {
    const { solid, dashed } = run(POINTS, 202602);
    expect(solid.map((p) => p.month)).toEqual([202601, 202602]);
    expect(dashed.map((p) => p.month)).toEqual([202602, 202603]);
  });

  it("omits the zero baseline when the balance never goes negative", () => {
    expect(run(POINTS, null).zeroY).toBeNull();
  });

  it("places a zero baseline when the balance crosses zero", () => {
    const crossing = [point(202601, 600000), point(202602, -2800000)];
    const { zeroY, frame } = run(crossing, null);
    expect(zeroY).not.toBeNull();
    expect(zeroY).toBeCloseTo(frame.valueScale(0));
  });

  it("centres each dot in its month band", () => {
    const { dots, frame } = run(POINTS, null);
    const band = frame.monthScale(202601) ?? 0;
    expect(dots[0].cx).toBeCloseTo(band + frame.monthScale.bandwidth() / 2);
  });

  it("labels each dot with its month and cumulative value", () => {
    expect(run(POINTS, null).dots[0].title).toBe(
      "Jan/26 · acumulado R$ 6.000,00",
    );
  });

  it("survives an empty series without NaN", () => {
    const { dots, solid, dashed } = run([], null);
    expect(dots).toEqual([]);
    expect(solid).toEqual([]);
    expect(dashed).toEqual([]);
  });
});
