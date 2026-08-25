import { describe, expect, it } from "@jest/globals";
import type { CeilingMonth } from "@/app/api/dashboard/ceiling.types.ts";
import {
  dotsFor,
  seriesValues,
} from "@/app/_components/DashboardScreen/components/BalanceLineChart/line-series.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative }) as MonthPoint;

const teto = (month: number, ceilingLeft: number, budget = 50): CeilingMonth =>
  ({ month, budget, ceilingBalance: 0, ceilingLeft });

const points = [point(202_601, 100), point(202_602, 200), point(202_603, 300)];
const xOf = (month: number) => month;
const yOf = (value: number) => value;

describe("seriesValues", () => {
  it("lists cumulatives then every ceilingLeft", () => {
    expect(seriesValues(points, [teto(202_602, -200)])).toEqual([
      100, 200, 300, -200,
    ]);
  });
});

describe("dotsFor", () => {
  it("keeps one current dot per month when there is no teto series", () => {
    const dots = dotsFor(points, [], Number.POSITIVE_INFINITY, xOf, yOf);

    expect(dots).toHaveLength(3);
    expect(dots.map((dot) => dot.key)).toEqual([
      "202601-cumulative",
      "202602-cumulative",
      "202603-cumulative",
    ]);
  });

  it("adds teto dots only for ceiling months", () => {
    const dots = dotsFor(
      points,
      [teto(202_602, 40), teto(202_603, 20)],
      Number.POSITIVE_INFINITY,
      xOf,
      yOf,
    );

    expect(dots.map((dot) => dot.key)).toEqual([
      "202601-cumulative",
      "202602-cumulative",
      "202603-cumulative",
      "202602-teto",
      "202603-teto",
    ]);
    expect(dots[3].cy).toBe(40);
  });

  it("puts both dots on the same y when ceilingLeft equals cumulative", () => {
    const dots = dotsFor(points, [teto(202_602, 200, 0)], 0, xOf, yOf);
    const current = dots.find((dot) => dot.key === "202602-cumulative");
    const spent = dots.find((dot) => dot.key === "202602-teto");

    expect(current?.cy).toBe(spent?.cy);
  });
});
