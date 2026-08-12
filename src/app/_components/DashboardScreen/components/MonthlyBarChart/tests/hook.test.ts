import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useMonthlyBarChart } from "@/app/_components/DashboardScreen/components/MonthlyBarChart/hook.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, estimated = false) =>
  ({
    month,
    income: 1000,
    expense: 400,
    cumulative: 600,
    incomeEstimated: estimated,
    expenseEstimated: false,
  }) as MonthPoint;

const points = [point(202_601), point(202_602, true)];

const chart = (dashedFrom: number | null) =>
  renderHook(() =>
    useMonthlyBarChart({ points, dashedFrom, width: 884, height: 240 }),
  ).result.current;

describe("useMonthlyBarChart", () => {
  it("draws one bar per side per month", () => {
    const { bars } = chart(null);

    expect(bars).toHaveLength(4);
    expect(bars.map((bar) => bar.key)).toEqual([
      "202601-income",
      "202601-expense",
      "202602-income",
      "202602-expense",
    ]);
  });

  it("sits the pair side by side inside the month's own band", () => {
    const [income, expense] = chart(null).bars;

    expect(expense.x).toBeGreaterThan(income.x);
    expect(income.width).toBe(expense.width);
  });

  it("titles each bar with its month, side, figure and provenance", () => {
    const { bars } = chart(null);

    expect(bars[0].title).toBe("Jan/26 · Entradas · R$ 10,00 · lançado");
    expect(bars[2].title).toContain("previsto");
  });

  it("reads the projected flag off the payload, per side", () => {
    const { bars } = chart(null);

    expect(bars.map((bar) => bar.estimated)).toEqual([
      false,
      false,
      true,
      false,
    ]);
  });

  it("washes nothing while no month is projected", () => {
    expect(chart(null).band).toBeNull();
  });

  it("washes from the first projected month to the trailing edge", () => {
    const { band, frame } = chart(202_602);

    expect(band?.x).toBeGreaterThan(0);
    expect((band?.x ?? 0) + (band?.width ?? 0)).toBe(frame.innerWidth);
  });
});
