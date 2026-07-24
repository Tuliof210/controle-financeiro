import { describe, expect, it } from "vitest";
import { buildMonths, formatYyyymm } from "./month.helper";

describe("buildMonths", () => {
  it("enumerates every month between start and end inclusive", () => {
    expect(buildMonths(202608, 202612)).toEqual([
      202608, 202609, 202610, 202611, 202612,
    ]);
  });

  it("wraps across a year boundary", () => {
    expect(buildMonths(202511, 202602)).toEqual([
      202511, 202512, 202601, 202602,
    ]);
  });

  it("returns a single-element list for a single-month period", () => {
    expect(buildMonths(202612, 202612)).toEqual([202612]);
  });

  it("returns an empty list when start is after end", () => {
    expect(buildMonths(202612, 202601)).toEqual([]);
  });
});

describe("formatYyyymm", () => {
  it("formats a YYYYMM integer as Mon/YY", () => {
    expect(formatYyyymm(202501)).toBe("Jan/25");
    expect(formatYyyymm(202608)).toBe("Ago/26");
  });
});
