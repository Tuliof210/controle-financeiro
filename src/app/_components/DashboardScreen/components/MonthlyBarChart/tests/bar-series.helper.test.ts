import { describe, expect, it } from "@jest/globals";
import {
  bandOf,
  bandStartOf,
  estimatedFor,
} from "@/app/_components/DashboardScreen/components/MonthlyBarChart/bar-series.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = {
  incomeEstimated: true,
  expenseEstimated: false,
  simulated: false,
} as MonthPoint;

describe("estimatedFor", () => {
  it("reads each series' own flag", () => {
    expect(estimatedFor(point, "income")).toBe(true);
    expect(estimatedFor(point, "expense")).toBe(false);
  });
});

describe("bandStartOf", () => {
  it("takes the leading edge of the first projected month's band", () => {
    expect(bandStartOf(202_608, () => 120)).toBe(120);
  });

  it("reports nothing when no month is projected", () => {
    expect(bandStartOf(null, () => 120)).toBeNull();
  });

  it("reports nothing when the month fell outside the range", () => {
    expect(bandStartOf(202_608, () => undefined)).toBeNull();
  });
});

describe("bandOf", () => {
  it("washes from the band start to the plot's trailing edge", () => {
    expect(bandOf(120, 400)).toEqual({ x: 120, width: 280 });
  });

  it("never draws a negative width", () => {
    expect(bandOf(500, 400)).toEqual({ x: 500, width: 0 });
  });

  it("draws nothing when nothing is projected", () => {
    expect(bandOf(null, 400)).toBeNull();
  });
});
