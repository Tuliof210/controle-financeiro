import { describe, expect, it } from "vitest";
import type { Goal } from "@/core/entities/goal.entity";
import { projectGoals } from "./goals.helper";

const goal = (targetCents: number): Goal => ({
  id: "g1",
  name: "Carro",
  targetCents,
  createdAt: new Date(0),
});

describe("projectGoals", () => {
  it("rounds a partial month up", () => {
    // 2500 / 1000 = 2.5 months of saving -> 3
    expect(projectGoals([goal(2500)], 1000)[0].months).toBe(3);
  });

  it("returns a whole number of months when it divides evenly", () => {
    expect(projectGoals([goal(3000)], 1000)[0].months).toBe(3);
  });

  it("never reports zero months for a target below one month's pace", () => {
    expect(projectGoals([goal(1)], 1000)[0].months).toBe(1);
  });

  it("returns null for every goal when the pace is zero", () => {
    expect(
      projectGoals([goal(2500), goal(10)], 0).map((g) => g.months),
    ).toEqual([null, null]);
  });

  it("carries the goal's identity through", () => {
    expect(projectGoals([goal(2500)], 1000)[0]).toEqual({
      id: "g1",
      name: "Carro",
      targetCents: 2500,
      months: 3,
    });
  });

  it("returns an empty list when no goals are saved", () => {
    expect(projectGoals([], 1000)).toEqual([]);
  });
});
