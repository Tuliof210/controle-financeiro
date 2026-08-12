/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { periodOf } from "@/app/api/ofx/period.helper.ts";

describe("periodOf", () => {
  it("returns null when nothing bounds the report", () => {
    expect(periodOf([], [null, null])).toBeNull();
  });

  it("widens the declared window to cover every transaction", () => {
    expect(periodOf([202_512, 202_603], [202_601, 202_602])).toEqual([
      202_512, 202_603,
    ]);
  });

  it("uses the declared window when no row posted", () => {
    expect(periodOf([], [202_601, 202_603])).toEqual([202_601, 202_603]);
  });

  it("ignores the null halves of a declared window", () => {
    expect(periodOf([202_602], [null, 202_604])).toEqual([202_602, 202_604]);
  });

  it("drops a corrupt declared bound in favour of the real rows", () => {
    expect(periodOf([202_601, 202_603], [202_601, 999_912])).toEqual([
      202_601, 202_603,
    ]);
  });

  it("returns null when only the declared window is corrupt and absurd", () => {
    expect(periodOf([], [190_001, 999_912])).toBeNull();
  });

  it("keeps the most recent 240 months when the rows themselves overrun", () => {
    expect(periodOf([190_001, 202_612], [])).toEqual([200_701, 202_612]);
  });
});
