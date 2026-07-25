import { describe, expect, it } from "vitest";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { buildFrame, leftMargin } from "./chart-frame.helper";

const point = (month: number, over: Partial<MonthPoint> = {}): MonthPoint => ({
  month,
  income: 0,
  expense: 0,
  balance: 0,
  cumulative: 0,
  incomeEstimated: false,
  expenseEstimated: false,
  realIncome: 0,
  realExpense: 0,
  estimatedIncome: 0,
  estimatedExpense: 0,
  ...over,
});

// Small income, large negative cumulative: the two series produce different
// tick labels, which is exactly what skewed the charts apart before.
const POINTS = [
  point(202601, { income: 900000, expense: 250000, cumulative: 600000 }),
  point(202602, { income: 900000, expense: 250000, cumulative: -2800000 }),
  point(202603, { income: 900000, expense: 250000, cumulative: -2150000 }),
];

const barFrame = () =>
  buildFrame(
    POINTS,
    POINTS.flatMap((p) => [p.income, p.expense]),
    600,
    260,
  );
const lineFrame = () =>
  buildFrame(
    POINTS,
    POINTS.map((p) => p.cumulative),
    600,
    260,
  );

describe("buildFrame", () => {
  it("gives both charts the same left margin despite different y series", () => {
    expect(barFrame().left).toBe(lineFrame().left);
  });

  it("puts both charts' month bands at identical x positions", () => {
    const bar = barFrame();
    const line = lineFrame();
    // The alignment the bar chart and the line chart are read against each
    // other for: a per-chart margin skewed these by up to 11px.
    expect(POINTS.map((p) => bar.monthScale(p.month))).toEqual(
      POINTS.map((p) => line.monthScale(p.month)),
    );
    expect(bar.innerWidth).toBe(line.innerWidth);
  });

  it("still scales each chart on its own values", () => {
    // Same frame, different domains — the bars never go negative, the line does.
    expect(barFrame().valueScale.domain()[0]).toBe(0);
    expect(lineFrame().valueScale.domain()[0]).toBeLessThan(0);
  });

  it("survives an empty series without a collapsed scale", () => {
    const frame = buildFrame([], [], 600, 260);
    expect(frame.innerWidth).toBeGreaterThan(0);
    expect(frame.valueScale.domain()).toEqual([0, 1]);
    expect(frame.tickValues).toEqual([]);
  });

  it("never returns a negative inner box for a width smaller than the margin", () => {
    const frame = buildFrame(POINTS, [1000], 10, 10);
    expect(frame.innerWidth).toBe(0);
    expect(frame.innerHeight).toBe(0);
  });
});

describe("leftMargin", () => {
  it("widens for a signed label so the SVG root does not clip it", () => {
    // "−R$ 20.000" is 10 chars vs "R$ 40.000" at 9 — the case a fixed 68px
    // margin clipped once the balance went negative.
    expect(leftMargin(["−R$ 20.000"])).toBeGreaterThan(
      leftMargin(["R$ 40.000"]),
    );
  });

  it("sizes from the longest label, not the last", () => {
    // Longest FIRST, so a `.at(-1)` implementation fails this.
    expect(leftMargin(["−R$ 1.234.567", "R$ 0"])).toBe(
      leftMargin(["−R$ 1.234.567"]),
    );
  });

  it("still returns the gutter for no labels", () => {
    expect(leftMargin([])).toBeGreaterThan(0);
  });
});
