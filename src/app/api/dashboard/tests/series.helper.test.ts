/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  buildSeries,
  firstEstimatedMonth,
} from "@/app/api/dashboard/series.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";

const movement = (month: number, type: string, valueCents: number) =>
  ({ month, type, valueCents }) as Movement;
const forecast = (months: number[], type: string, valueCents: number) =>
  ({ months, type, valueCents }) as Forecast;

const MONTHS = [202_601, 202_602];

describe("buildSeries", () => {
  it("yields a zeroed point for a month with no data", () => {
    expect(buildSeries([202_601], [], [])[0]).toEqual({
      month: 202_601,
      income: 0,
      expense: 0,
      balance: 0,
      cumulative: 0,
      incomeEstimated: false,
      expenseEstimated: false,
      simulated: false,
    });
  });

  it("lets the more complete side win, per type", () => {
    const [point] = buildSeries(
      [202_601],
      [movement(202_601, "income", 900), movement(202_601, "expense", 100)],
      [forecast([202_601], "income", 500), forecast([202_601], "expense", 400)],
    );

    expect(point).toMatchObject({ income: 900, expense: 400, balance: 500 });
  });

  it("marks a side estimated only when the commitment strictly exceeds it", () => {
    const [point] = buildSeries(
      [202_601],
      [movement(202_601, "income", 500)],
      [forecast([202_601], "income", 500), forecast([202_601], "expense", 100)],
    );

    expect(point.incomeEstimated).toBe(false);
    expect(point.expenseEstimated).toBe(true);
  });

  it("runs the cumulative balance across the range", () => {
    const points = buildSeries(
      MONTHS,
      [movement(202_601, "income", 300), movement(202_602, "expense", 100)],
      [],
    );

    expect(points.map((point) => point.cumulative)).toEqual([300, 200]);
  });
});

describe("firstEstimatedMonth", () => {
  const point = (month: number, estimated: boolean) =>
    ({
      month,
      incomeEstimated: false,
      expenseEstimated: estimated,
    }) as MonthPoint;

  it("names the first month the line goes dashed", () => {
    expect(
      firstEstimatedMonth([point(202_601, false), point(202_602, true)]),
    ).toBe(202_602);
  });

  it("returns null when every month is real-dominant", () => {
    expect(firstEstimatedMonth([point(202_601, false)])).toBeNull();
  });
});
