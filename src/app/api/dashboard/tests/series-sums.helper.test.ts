/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  accumulate,
  emptySums,
} from "@/app/api/dashboard/series-sums.helper.ts";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";

const movement = (month: number, type: string, valueCents: number) =>
  ({ month, type, valueCents }) as Movement;
const forecast = (months: number[], type: string, valueCents: number) =>
  ({ months, type, valueCents }) as Forecast;

const MONTHS = [202_601, 202_602];

describe("emptySums", () => {
  it("starts every side at zero, and neither side simulated", () => {
    expect(emptySums()).toEqual({
      realIncome: 0,
      realExpense: 0,
      estIncome: 0,
      estExpense: 0,
      simIncome: false,
      simExpense: false,
    });
  });
});

describe("accumulate", () => {
  it("seeds a zeroed entry for every month of the range", () => {
    const sums = accumulate(MONTHS, [], []);

    expect([...sums.keys()]).toEqual(MONTHS);
    expect(sums.get(202_602)).toEqual(emptySums());
  });

  it("splits movements into the real income and expense sides", () => {
    const sums = accumulate(
      MONTHS,
      [
        movement(202_601, "income", 500),
        movement(202_601, "expense", 200),
        movement(202_601, "income", 100),
      ],
      [],
    );

    expect(sums.get(202_601)).toMatchObject({
      realIncome: 600,
      realExpense: 200,
    });
  });

  it("adds a forecast's full value to each active month", () => {
    const sums = accumulate(
      MONTHS,
      [],
      [forecast([202_601, 202_602], "expense", 300)],
    );

    expect(sums.get(202_601)?.estExpense).toBe(300);
    expect(sums.get(202_602)?.estExpense).toBe(300);
  });

  it("accumulates estimated income too", () => {
    const sums = accumulate(MONTHS, [], [forecast([202_602], "income", 700)]);

    expect(sums.get(202_602)?.estIncome).toBe(700);
  });

  it("drops entries whose month is outside the range", () => {
    const sums = accumulate(
      MONTHS,
      [movement(202_512, "income", 900)],
      [forecast([202_712], "expense", 900)],
    );

    expect(sums.size).toBe(MONTHS.length);
    expect(sums.get(202_601)).toEqual(emptySums());
  });
});
