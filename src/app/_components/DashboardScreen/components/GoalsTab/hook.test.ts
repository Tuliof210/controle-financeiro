import { describe, expect, it } from "vitest";
import type { GoalProjection } from "@/app/api/dashboard/types";
import type { BoardData } from "../Board/hook";
import { useGoalsTab } from "./hook";

const goal = (over: Partial<GoalProjection> = {}): GoalProjection => ({
  id: "g1",
  name: "Carro",
  targetCents: 5000000,
  months: 7,
  doneMonth: 202702,
  accruedCents: 6000000,
  neededCents: 500000,
  ...over,
});

const tab = (goals: GoalProjection[], pace = 179388) =>
  useGoalsTab({ data: { goals, pace } as unknown as BoardData });

describe("useGoalsTab", () => {
  it("headlines the saving pace and says what it is", () => {
    const view = tab([]);
    expect(view.capacity).toBe("R$ 1.793,88");
    expect(view.caption).toBe("guardando 25% da menor folga do período");
  });

  it("changes the caption rather than dividing by a zero pace", () => {
    const view = tab([goal()], 0);
    expect(view.capacity).toBe("R$ 0,00");
    expect(view.caption).toBe("sem folga projetada no período");
  });

  it("counts goals the PERIOD covers, not goals achieved", () => {
    // doneMonth is the producer's only flag for "funded inside the range";
    // counting anything else would claim a state this data cannot support.
    // Deliberately lopsided — a 2-of-4 split passes even with the predicate
    // inverted, which is exactly the tautology .squad/learnings.md warns about.
    const goals = [
      goal({ id: "a" }),
      goal({ id: "b", doneMonth: null }),
      goal({ id: "c", doneMonth: null }),
      goal({ id: "d", doneMonth: null }),
    ];
    expect(tab(goals).covered).toBe("1 / 4");
  });

  it("sums every target, not just the covered ones", () => {
    const goals = [
      goal({ id: "a", targetCents: 5000000 }),
      goal({ id: "b", targetCents: 1200000, doneMonth: null }),
      goal({ id: "c", targetCents: 600000 }),
    ];
    expect(tab(goals).total).toBe("R$ 68.000");
  });

  it("reports an empty board without a NaN total or a 0/0 crash", () => {
    const view = tab([]);
    expect(view.empty).toBe(true);
    expect(view.covered).toBe("0 / 0");
    expect(view.total).toBe("R$ 0");
  });

  it("is not empty as soon as ONE goal exists", () => {
    // The single-goal case is the one a `length <= 1` guard would swallow.
    expect(tab([goal()]).empty).toBe(false);
  });

  it("keeps the order the producer sorted the goals into", () => {
    const goals = [goal({ id: "z" }), goal({ id: "a" })];
    expect(tab(goals).goals.map((g) => g.id)).toEqual(["z", "a"]);
  });
});
