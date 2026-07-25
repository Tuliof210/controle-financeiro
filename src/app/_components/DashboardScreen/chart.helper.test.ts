import { describe, expect, it } from "vitest";
import { axisTickMonths, dashSplit, yDomain } from "./chart.helper";

const point = (month: number) =>
  ({ month }) as unknown as Parameters<typeof dashSplit>[0][number];

const MONTHS = [202601, 202602, 202603, 202604];
const POINTS = MONTHS.map(point);

describe("yDomain", () => {
  it("anchors an all-positive series at zero", () => {
    expect(yDomain([300, 900, 1500])).toEqual([0, 1500]);
  });

  it("anchors an all-negative series at zero", () => {
    expect(yDomain([-300, -900])).toEqual([-900, 0]);
  });

  it("spans both sides of zero for a mixed series", () => {
    expect(yDomain([-400, 200, 900])).toEqual([-400, 900]);
  });

  it("widens a degenerate all-zero series so the scale has height", () => {
    expect(yDomain([0, 0])).toEqual([0, 1]);
    expect(yDomain([])).toEqual([0, 1]);
  });

  it("keeps a single non-zero value paired with the baseline", () => {
    expect(yDomain([500])).toEqual([0, 500]);
  });
});

describe("dashSplit", () => {
  it("leaves the whole line solid when nothing is projected", () => {
    expect(dashSplit(POINTS, null)).toEqual({ solid: POINTS, dashed: [] });
  });

  it("shares the boundary point between both segments", () => {
    const { solid, dashed } = dashSplit(POINTS, 202603);
    expect(solid.map((p) => p.month)).toEqual([202601, 202602, 202603]);
    expect(dashed.map((p) => p.month)).toEqual([202603, 202604]);
    // The shared month is what keeps the two paths visually connected.
    expect(solid.at(-1)).toBe(dashed[0]);
  });

  it("draws no solid segment when the first month is already projected", () => {
    const { solid, dashed } = dashSplit(POINTS, 202601);
    expect(solid).toEqual([]);
    expect(dashed).toEqual(POINTS);
  });

  it("falls back to solid when dashedFrom is past the whole range", () => {
    expect(dashSplit(POINTS, 202612)).toEqual({ solid: POINTS, dashed: [] });
  });

  it("handles a single-month range", () => {
    const one = [point(202601)];
    expect(dashSplit(one, 202601)).toEqual({ solid: [], dashed: one });
    expect(dashSplit(one, null)).toEqual({ solid: one, dashed: [] });
  });
});

describe("axisTickMonths", () => {
  it("labels every month when they already fit", () => {
    expect(axisTickMonths(MONTHS, 6)).toEqual(MONTHS);
  });

  it("samples every Nth month once they do not", () => {
    const year = Array.from({ length: 12 }, (_, i) => 202601 + i);
    expect(axisTickMonths(year, 6)).toEqual([
      202601, 202603, 202605, 202607, 202609, 202611,
    ]);
  });

  it("never returns more labels than asked for", () => {
    const long = Array.from({ length: 36 }, (_, i) => i);
    expect(axisTickMonths(long, 6).length).toBeLessThanOrEqual(6);
  });
});
