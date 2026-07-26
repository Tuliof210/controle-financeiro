import { describe, expect, it } from "vitest";
import { periodOf } from "./period.helper";

describe("periodOf — the ordinary file", () => {
  it("spans the declared window", () => {
    expect(periodOf([202601, 202602], [202601, 202603])).toEqual([
      202601, 202603,
    ]);
  });

  it("widens the declared window to cover a transaction outside it", () => {
    expect(periodOf([202512, 202602], [202601, 202602])).toEqual([
      202512, 202602,
    ]);
  });

  it("falls back to the transactions when nothing was declared", () => {
    expect(periodOf([202601, 202604], [null, null])).toEqual([202601, 202604]);
  });

  it("uses the declared window when no transaction posted", () => {
    expect(periodOf([], [202601, 202603])).toEqual([202601, 202603]);
  });

  it("has no period at all when there is nothing to go on", () => {
    expect(periodOf([], [null, null])).toBeNull();
  });
});

describe("periodOf — the corrupt bound", () => {
  // The guard exists so buildMonths is never asked for ~950k rows. What it
  // must NOT do is anchor on the corrupt end: clamping to "the most recent 240
  // months of 9999-12" would drop every real transaction and leave a table of
  // zeros, which the service would then report as an empty statement.
  it("drops an absurd declared window in favour of the transactions", () => {
    expect(periodOf([202601, 202602], [190001, 999912])).toEqual([
      202601, 202602,
    ]);
  });

  it("has no period when the absurd window is all there is", () => {
    expect(periodOf([], [190001, 999912])).toBeNull();
  });

  it("keeps the most recent 240 months when the transactions span more", () => {
    expect(periodOf([190001, 202602], [null, null])).toEqual([200603, 202602]);
  });

  it("accepts a window of exactly 240 months", () => {
    expect(periodOf([], [200603, 202602])).toEqual([200603, 202602]);
  });
});
