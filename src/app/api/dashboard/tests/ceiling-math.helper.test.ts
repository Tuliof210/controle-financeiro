/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  firstRedOf,
  rates,
  suffixMinimum,
  tightestMonth,
  tightestOf,
} from "@/app/api/dashboard/ceiling-math.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative }) as MonthPoint;

describe("rates", () => {
  it("floors the weekly and daily cadences", () => {
    expect(rates(1000)).toEqual({ monthly: 1000, weekly: 250, daily: 33 });
  });

  it("keeps a zero allowance zero at every cadence", () => {
    expect(rates(0)).toEqual({ monthly: 0, weekly: 0, daily: 0 });
  });
});

describe("suffixMinimum", () => {
  it("carries the worst balance ahead of each month", () => {
    const ahead = [
      point(202_601, 500),
      point(202_602, 200),
      point(202_603, 900),
    ];

    expect(suffixMinimum(ahead)).toEqual([200, 200, 900]);
  });

  it("returns [] for an empty range instead of seeding Infinity", () => {
    expect(suffixMinimum([])).toEqual([]);
  });

  it("returns the lone balance for a single month", () => {
    expect(suffixMinimum([point(202_601, 700)])).toEqual([700]);
  });
});

describe("tightestMonth", () => {
  it("names the month holding the floor", () => {
    const ahead = [point(202_601, 500), point(202_602, 200)];

    expect(tightestMonth(ahead, 200)).toBe(202_602);
  });

  it("falls back to the first month when no balance matches", () => {
    expect(tightestMonth([point(202_601, 500)], 42)).toBe(202_601);
  });
});

describe("tightestOf", () => {
  it("names nothing while no money is offered", () => {
    expect(tightestOf(0, [point(202_601, 500)], [500])).toBeNull();
  });

  it("names the limiting month once something is offered", () => {
    const ahead = [point(202_601, 500), point(202_602, 200)];

    expect(tightestOf(50, ahead, [200, 200])).toBe(202_602);
  });
});

describe("firstRedOf", () => {
  it("reports the shortfall as a positive figure", () => {
    expect(firstRedOf(point(202_604, -1500))).toEqual({
      month: 202_604,
      shortfall: 1500,
    });
  });

  it("reports null when no month is underwater", () => {
    expect(firstRedOf(undefined)).toBeNull();
  });
});
