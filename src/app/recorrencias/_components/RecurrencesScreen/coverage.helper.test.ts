import { describe, expect, it } from "vitest";
import { buildMonths } from "@/lib/months";
import { coverage } from "./coverage.helper";

// A 12-month range, so every fixture below lands on a round percentage.
const RANGE = { start: 202601, end: 202612 };
const months = (start: number, end: number) => buildMonths(start, end);

describe("coverage", () => {
  it("fills the whole track when the recurrence spans the whole range", () => {
    expect(coverage(months(202601, 202612), RANGE)).toEqual([
      { left: "0%", width: "100%" },
    ]);
  });

  it("fills the first half for a recurrence covering the first six months", () => {
    expect(coverage(months(202601, 202606), RANGE)).toEqual([
      { left: "0%", width: "50%" },
    ]);
  });

  it("clamps a recurrence that starts before the range", () => {
    expect(coverage(months(202510, 202603), RANGE)).toEqual([
      { left: "0%", width: "25%" },
    ]);
  });

  it("clamps a recurrence that ends after the range", () => {
    expect(coverage(months(202610, 202704), RANGE)).toEqual([
      { left: "75%", width: "25%" },
    ]);
  });

  it("returns nothing to draw when the recurrence is entirely outside", () => {
    expect(coverage(months(202701, 202706), RANGE)).toEqual([]);
  });

  it("draws one segment per contiguous interval, so a gap stays a gap", () => {
    expect(
      coverage([...months(202601, 202603), ...months(202607, 202612)], RANGE),
    ).toEqual([
      { left: "0%", width: "25%" },
      { left: "50%", width: "50%" },
    ]);
  });

  it("draws a single-month recurrence as one month of the range", () => {
    expect(coverage([202605], RANGE)).toEqual([
      { left: "33.3333%", width: "8.3333%" },
    ]);
  });

  it("returns nothing to draw when the range is inverted", () => {
    expect(
      coverage(months(202601, 202612), { start: 202612, end: 202601 }),
    ).toEqual([]);
  });
});
