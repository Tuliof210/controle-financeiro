import { describe, expect, it } from "vitest";
import type { MonthPoint } from "@/app/api/dashboard/types";
import { DESKTOP_PLOT_WIDTH } from "./chart.config";
import { buildFrame, leftMargin } from "./chart-frame.helper";

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

// Small income, large negative cumulative: the two series produce different
// tick labels, which is exactly what skewed the charts apart before.
const POINTS = [
  point(202601, { income: 900000, expense: 250000, cumulative: 600000 }),
  point(202602, { income: 900000, expense: 250000, cumulative: -2800000 }),
  point(202603, { income: 900000, expense: 250000, cumulative: -2150000 }),
];

// count months; a fixed six-figure cumulative gives left a realistic (not
// near-zero) width, without varying it by count — the tests below compare
// left/innerWidth across different counts at the same width.
const monthsPoints = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    point(202601 + i, { cumulative: -2_900_000 }),
  );
const zeroFrame = (count: number, width: number) => {
  const months = monthsPoints(count);
  return buildFrame(
    months,
    months.map(() => 0),
    width,
    260,
  );
};

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

describe("buildFrame — month window", () => {
  it("scrolls past the window size at a steady bandwidth, widening the window at the desktop breakpoint", () => {
    const six = zeroFrame(6, 600); // 600px mobile: 6-month window
    const twelve = zeroFrame(12, 600); // two full windows: double the content width
    expect(twelve.innerWidth).toBeCloseTo(six.innerWidth * 2, 0);
    // Roughly, not exactly: scaleBand's outer padding does not cancel out
    // perfectly across domain counts — not the old squeeze-to-fit, though,
    // where 12 months landed at HALF this bandwidth, not near it.
    const ratio = twelve.monthScale.bandwidth() / six.monthScale.bandwidth();
    expect(ratio).toBeCloseTo(1, 1);

    const w = DESKTOP_PLOT_WIDTH;
    expect(zeroFrame(9, w - 1).innerWidth).toBeGreaterThan(
      zeroFrame(6, w - 1).innerWidth, // same (mobile) width: 9 > 6-month window scrolls
    );
    expect(zeroFrame(9, w).innerWidth).toBeCloseTo(
      zeroFrame(12, w).innerWidth, // same (desktop) width: 9 < 12-month window fits
    );
  });

  it("thins x-axis labels only once the real per-month step cannot fit one", () => {
    // 291px is what ChartCard measured at a real 375px viewport: "Jan/24"
    // (36px) was WIDER than the actual per-month step there (~35px) and the
    // labels ran together before this thinning existed.
    const tight = zeroFrame(30, 291);
    expect(tight.tickValues.length).toBeLessThan(30);
    expect(tight.tickValues[0]).toBe(monthsPoints(30)[0].month);

    const roomy = zeroFrame(30, DESKTOP_PLOT_WIDTH * 3);
    expect(roomy.tickValues.length).toBe(30);
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
