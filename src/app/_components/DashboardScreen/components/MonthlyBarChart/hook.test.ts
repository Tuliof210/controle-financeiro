import { describe, expect, it } from "vitest";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { useMonthlyBarChart } from "./hook";

// useMonthlyBarChart calls no React hooks, so it runs under the repo's
// node-environment Vitest config — the no-jsdom limit blocks rendering, not a
// pure function. It produces the entire visual encoding: bar geometry, the
// `estimated` flag behind the 50% opacity, and the <title> that is the only
// non-colour channel carrying that same fact.
const point = (month: number, over: Partial<MonthPoint> = {}): MonthPoint => ({
  month,
  income: 0,
  expense: 0,
  balance: 0,
  cumulative: 0,
  incomeEstimated: false,
  expenseEstimated: false,
  ...over,
});

const run = (points: MonthPoint[]) =>
  useMonthlyBarChart({ points, width: 600, height: 260 });

describe("useMonthlyBarChart", () => {
  it("emits one bar per type per month", () => {
    const { bars } = run([point(202601), point(202602)]);
    expect(bars.map((bar) => bar.key)).toEqual([
      "202601-income",
      "202601-expense",
      "202602-income",
      "202602-expense",
    ]);
  });

  it("flags the two sides of one month independently", () => {
    // The case the whole encoding exists for: actuals won on income, the
    // commitment won on expense, in the SAME month.
    const { bars } = run([
      point(202603, {
        income: 900000,
        expense: 250000,
        incomeEstimated: false,
        expenseEstimated: true,
      }),
    ]);
    expect(bars.map((bar) => bar.estimated)).toEqual([false, true]);
    expect(bars[0].title).toBe("Mar/26 · Entradas · R$ 9.000,00 · lançado");
    expect(bars[1].title).toBe("Mar/26 · Saídas · R$ 2.500,00 · previsto");
  });

  it("measures bar height down from the zero baseline", () => {
    const { bars, frame } = run([point(202601, { income: 1000 })]);
    expect(bars[0].height).toBeCloseTo(
      frame.valueScale(0) - frame.valueScale(1000),
    );
    expect(bars[0].y).toBeCloseTo(frame.valueScale(1000));
  });

  it("sits the pair side by side inside the month band", () => {
    const { bars, frame } = run([point(202601, { income: 10, expense: 10 })]);
    const band = frame.monthScale(202601) ?? 0;
    expect(bars[0].x).toBeGreaterThanOrEqual(band);
    expect(bars[1].x).toBeGreaterThan(bars[0].x);
    expect(bars[1].x + bars[1].width).toBeLessThanOrEqual(
      band + frame.monthScale.bandwidth() + 0.01,
    );
  });

  it("gives a zero-valued month a zero-height bar rather than NaN", () => {
    const { bars } = run([point(202601)]);
    expect(bars.every((bar) => bar.height === 0)).toBe(true);
    expect(bars.every((bar) => Number.isFinite(bar.y))).toBe(true);
  });

  it("produces no bars for an empty series", () => {
    expect(run([]).bars).toEqual([]);
  });
});
