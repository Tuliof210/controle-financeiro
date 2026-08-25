/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { buildCeiling } from "@/app/api/dashboard/ceiling.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

// Its own file rather than more cases in ceiling.helper.test.ts: that file's
// seven cases pin the budgets, and leaving them untouched is the proof that
// headroomCents did not walk into the arithmetic.
const point = (month: number, cumulative: number) =>
  ({ month, cumulative }) as MonthPoint;

const flat = [point(202_601, 1000), point(202_602, 1000), point(202_603, 1000)];

describe("buildCeiling headroomCents", () => {
  it("is the same figure whatever the target asked for", () => {
    const headrooms = [25, 50, 75, 100].map(
      (cap) => buildCeiling(flat, 202_601, cap, null).headroomCents,
    );

    // The worst balance ahead is 1000, and neither the percentage nor the Meta
    // limit moves it — it is what a fixed ceiling would have to stay under.
    expect(headrooms).toEqual([1000, 1000, 1000, 1000]);
    expect(buildCeiling(flat, 202_601, 100, 300).headroomCents).toBe(1000);
  });

  it("reads the worst month ahead, not the current one", () => {
    const ceiling = buildCeiling(
      [point(202_601, 1000), point(202_602, 400)],
      202_601,
      50,
      null,
    );

    expect(ceiling.headroomCents).toBe(400);
  });

  it("ignores months before the current one, as the budgets do", () => {
    const ceiling = buildCeiling(
      [point(202_512, 10), ...flat],
      202_601,
      50,
      null,
    );

    expect(ceiling.headroomCents).toBe(1000);
  });

  it("is zero once a month ahead is already underwater", () => {
    const ceiling = buildCeiling(
      [point(202_601, 1000), point(202_602, -200)],
      202_601,
      50,
      null,
    );

    expect(ceiling.headroomCents).toBe(0);
  });
});
