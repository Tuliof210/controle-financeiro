/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import type {
  Ceiling,
  CeilingMonth,
} from "@/app/api/dashboard/ceiling.types.ts";
import { savingPace } from "@/app/api/dashboard/pace.helper.ts";

const ceilingOf = (budgets: number[]) =>
  ({
    monthly: budgets[0],
    months: budgets.map((budget) => ({ budget }) as CeilingMonth),
  }) as Ceiling;

const QUARTER = { mode: "percent", percent: 25 } as const;

describe("savingPace", () => {
  it("is the saved share of this month's teto", () => {
    expect(savingPace(ceilingOf([1000, 1000]), QUARTER)).toBe(250);
  });

  it("follows this month's teto, not the mean of the column", () => {
    expect(savingPace(ceilingOf([4000, 0, 0, 0]), QUARTER)).toBe(1000);
  });

  it("floors the share of this month's teto once", () => {
    expect(savingPace(ceilingOf([100, 101]), QUARTER)).toBe(25);
  });

  it("is zero when the period leaves no room at all", () => {
    expect(savingPace(ceilingOf([0, 0]), QUARTER)).toBe(0);
  });

  it("follows the share it was handed, not a fixed quarter", () => {
    expect(
      savingPace(ceilingOf([1000, 1000]), { mode: "percent", percent: 50 }),
    ).toBe(500);
  });

  it("returns a fixed amount as it stands, ceiling or no ceiling", () => {
    const target = { mode: "fixed", cents: 900 } as const;

    expect(savingPace(ceilingOf([1000, 1000]), target)).toBe(900);
    expect(savingPace(ceilingOf([0, 0]), target)).toBe(900);
  });
});
