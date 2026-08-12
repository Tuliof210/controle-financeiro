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
    months: budgets.map((budget) => ({ budget }) as CeilingMonth),
  }) as Ceiling;

describe("savingPace", () => {
  it("is a quarter of the mean monthly ceiling", () => {
    expect(savingPace(ceilingOf([1000, 1000]))).toBe(250);
  });

  it("averages a front-loaded column instead of following its first month", () => {
    expect(savingPace(ceilingOf([4000, 0, 0, 0]))).toBe(250);
  });

  it("floors once, on the quarter of the raw mean", () => {
    expect(savingPace(ceilingOf([100, 101]))).toBe(25);
  });

  it("is zero when the period leaves no room at all", () => {
    expect(savingPace(ceilingOf([0, 0]))).toBe(0);
  });
});
