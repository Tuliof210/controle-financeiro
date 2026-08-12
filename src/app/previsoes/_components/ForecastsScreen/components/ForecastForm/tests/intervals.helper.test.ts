import { describe, expect, it } from "@jest/globals";
import {
  intervalsToMonths,
  monthsToIntervals,
} from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/intervals.helper.ts";

describe("intervalsToMonths", () => {
  it("flattens an interval into every month it covers", () => {
    expect(intervalsToMonths([{ start: 202_611, end: 202_701 }])).toEqual([
      202_611, 202_612, 202_701,
    ]);
  });

  it("dedupes and sorts across overlapping intervals", () => {
    expect(
      intervalsToMonths([
        { start: 202_603, end: 202_604 },
        { start: 202_601, end: 202_603 },
      ]),
    ).toEqual([202_601, 202_602, 202_603, 202_604]);
  });

  it("drops an inverted interval, which covers nothing", () => {
    expect(intervalsToMonths([{ start: 202_604, end: 202_601 }])).toEqual([]);
  });
});

describe("monthsToIntervals", () => {
  it("collapses consecutive months into one interval", () => {
    expect(monthsToIntervals([202_601, 202_602, 202_603])).toEqual([
      { start: 202_601, end: 202_603 },
    ]);
  });

  it("collapses across the year boundary", () => {
    expect(monthsToIntervals([202_612, 202_701])).toEqual([
      { start: 202_612, end: 202_701 },
    ]);
  });

  it("starts a new interval at a gap", () => {
    expect(monthsToIntervals([202_601, 202_603])).toEqual([
      { start: 202_601, end: 202_601 },
      { start: 202_603, end: 202_603 },
    ]);
  });

  it("sorts and dedupes before grouping", () => {
    expect(monthsToIntervals([202_602, 202_601, 202_602])).toEqual([
      { start: 202_601, end: 202_602 },
    ]);
  });

  it("round-trips a non-contiguous selection", () => {
    const months = [202_601, 202_602, 202_607];

    expect(intervalsToMonths(monthsToIntervals(months))).toEqual(months);
  });

  it("yields nothing for no months", () => {
    expect(monthsToIntervals([])).toEqual([]);
  });
});
