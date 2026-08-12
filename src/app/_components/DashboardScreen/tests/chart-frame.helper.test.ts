import { describe, expect, it } from "@jest/globals";
import { buildFrame } from "@/app/_components/DashboardScreen/chart-frame.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, income: 1000, expense: 400, cumulative }) as MonthPoint;

const months = (count: number) =>
  Array.from({ length: count }, (_, i) => point(202_601 + i, (i + 1) * 100));

describe("buildFrame", () => {
  it("scales the plot inside the shared margins", () => {
    const frame = buildFrame(months(3), [100, 200, 300], 884, 240);

    expect(frame.innerHeight).toBe(240 - 8 - 28);
    expect(frame.gridValues.length).toBeGreaterThan(0);
  });

  it("sizes the gutter on both series, so the two charts share one edge", () => {
    const bars = buildFrame(months(3), [1000, 400], 884, 240);
    const line = buildFrame(months(3), [100, 200, 300], 884, 240);

    expect(bars.left).toBe(line.left);
  });

  it("collapses to the visible width below the month window", () => {
    const frame = buildFrame(months(3), [100], 884, 240);

    expect(frame.innerWidth).toBe(884 - frame.left - 8);
  });

  it("grows past it once there are more months than the window holds", () => {
    const frame = buildFrame(months(24), [100], 884, 240);

    expect(frame.innerWidth).toBeGreaterThan(884 - frame.left - 8);
  });

  it("gives every month a band, thinning only the labels", () => {
    const frame = buildFrame(months(24), [100], 291, 240);

    expect(frame.monthScale.domain()).toHaveLength(24);
    expect(frame.tickValues.length).toBeLessThan(24);
  });

  it("labels every month when they all fit", () => {
    const frame = buildFrame(months(3), [100], 884, 240);

    expect(frame.tickValues).toHaveLength(3);
  });
});
