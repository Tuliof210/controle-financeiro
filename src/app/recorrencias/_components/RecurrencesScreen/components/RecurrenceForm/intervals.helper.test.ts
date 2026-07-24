import { describe, expect, it } from "vitest";
import { intervalsToMonths, monthsToIntervals } from "./intervals.helper";

describe("intervalsToMonths", () => {
  it("expands, dedupes, and sorts non-contiguous intervals", () => {
    expect(
      intervalsToMonths([
        { start: 202601, end: 202603 },
        { start: 202607, end: 202612 },
      ]),
    ).toEqual([
      202601, 202602, 202603, 202607, 202608, 202609, 202610, 202611, 202612,
    ]);
  });

  it("dedupes overlapping intervals", () => {
    expect(
      intervalsToMonths([
        { start: 202601, end: 202603 },
        { start: 202602, end: 202604 },
      ]),
    ).toEqual([202601, 202602, 202603, 202604]);
  });

  it("handles a single-month interval", () => {
    expect(intervalsToMonths([{ start: 202611, end: 202611 }])).toEqual([
      202611,
    ]);
  });
});

describe("monthsToIntervals", () => {
  it("groups consecutive months into one interval", () => {
    expect(monthsToIntervals([202601, 202602, 202603])).toEqual([
      { start: 202601, end: 202603 },
    ]);
  });

  it("splits non-adjacent months into separate intervals", () => {
    expect(monthsToIntervals([202601, 202602, 202603, 202607, 202608])).toEqual(
      [
        { start: 202601, end: 202603 },
        { start: 202607, end: 202608 },
      ],
    );
  });

  it("collapses adjacent months across a year boundary", () => {
    expect(monthsToIntervals([202511, 202512, 202601])).toEqual([
      { start: 202511, end: 202601 },
    ]);
  });

  it("renders a single month as a degenerate interval", () => {
    expect(monthsToIntervals([202605])).toEqual([
      { start: 202605, end: 202605 },
    ]);
  });

  it("returns [] for no months", () => {
    expect(monthsToIntervals([])).toEqual([]);
  });

  it("round-trips a non-contiguous selection", () => {
    const months = [202601, 202602, 202607, 202608, 202609];
    expect(intervalsToMonths(monthsToIntervals(months))).toEqual(months);
  });
});
