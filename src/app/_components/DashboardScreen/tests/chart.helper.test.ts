import { describe, expect, it } from "@jest/globals";
import {
  dashSplit,
  yDomain,
} from "@/app/_components/DashboardScreen/chart.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number) => ({ month }) as MonthPoint;
const points = [point(202_601), point(202_602), point(202_603)];

describe("yDomain", () => {
  it("always includes zero, so the baseline is a real line", () => {
    expect(yDomain([100, 500])).toEqual([0, 500]);
    expect(yDomain([-500, -100])).toEqual([-500, 0]);
  });

  it("spans both signs when the series crosses zero", () => {
    expect(yDomain([-200, 300])).toEqual([-200, 300]);
  });

  it("widens a degenerate domain so the scale has height", () => {
    expect(yDomain([0, 0])).toEqual([0, 1]);
    expect(yDomain([])).toEqual([0, 1]);
  });
});

describe("dashSplit", () => {
  it("draws everything solid when nothing is a projection", () => {
    expect(dashSplit(points, null)).toEqual({ solid: points, dashed: [] });
  });

  it("shares the boundary point so the line does not break", () => {
    const { solid, dashed } = dashSplit(points, 202_602);

    expect(solid).toEqual([points[0], points[1]]);
    expect(dashed).toEqual([points[1], points[2]]);
  });

  it("draws no solid run when the very first month is a projection", () => {
    const { solid, dashed } = dashSplit(points, 202_601);

    expect(solid).toEqual([]);
    expect(dashed).toEqual(points);
  });

  it("keeps everything solid when the dash month is past the range", () => {
    expect(dashSplit(points, 202_712)).toEqual({ solid: points, dashed: [] });
  });
});
