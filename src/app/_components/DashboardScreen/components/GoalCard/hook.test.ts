import { describe, expect, it } from "vitest";
import type { GoalProjection } from "@/app/api/dashboard/types";
import { useGoalCard } from "./hook";

// doneMonth is non-null exactly when accruedCents reaches targetCents; the
// producer guarantees it and these fixtures honour it. The default overshoots.
// The two timeline sentences are covered in timeline.helper.test.ts; this file
// is the coverage quantity — the bar, the badge, the tone and the sentence.
const goal = (over: Partial<GoalProjection> = {}): GoalProjection => ({
  id: "g1",
  name: "Viagem para o Chile",
  targetCents: 1200000,
  months: 7,
  doneMonth: 202702,
  accruedCents: 1500000,
  neededCents: 150000,
  ...over,
});

const card = (over: Partial<GoalProjection> = {}) =>
  useGoalCard({ goal: goal(over) });

const beyond = { doneMonth: null, accruedCents: 600000 };
const stalled = { months: null, doneMonth: null, accruedCents: 0 };
const noTarget = { targetCents: 0, doneMonth: null, accruedCents: 500000 };
// 4998000 of 5000000 is 99.96% — the case Math.round announced as a full,
// green "100%" card while the period misses the goal by R$ 20.
const nearly = {
  targetCents: 5000000,
  months: 13,
  doneMonth: null,
  accruedCents: 4998000,
  neededCents: 416667,
};

describe("useGoalCard", () => {
  it("reads a fully covered goal as 100%, full, and capped in words", () => {
    const view = card();
    expect(view.percent).toBe(100);
    expect(view.full).toBe(true);
    expect(view.badge).toBe("100%");
    // Capped: "R$ 15.000 de R$ 12.000" beside a full bar would read as a bug.
    expect(view.covered).toBe("o período cobre R$ 12.000 de R$ 12.000");
    expect(view.srLabel).toBe(
      "Viagem para o Chile: o período cobre 100% do objetivo",
    );
  });

  it("reads a partly covered goal at its true share", () => {
    const view = card({ targetCents: 5000000, accruedCents: 1250000 });
    expect(view.percent).toBe(25);
    expect(view.full).toBe(false);
    expect(view.badge).toBe("25%");
    expect(view.covered).toBe("o período cobre R$ 12.500 de R$ 50.000");
  });

  it("never announces 100% on a goal the period does not close", () => {
    // Floor, never round: 100 is reserved for a bar that is genuinely full.
    const view = card(nearly);
    expect(view.percent).toBe(99);
    expect(view.full).toBe(false);
    expect(view.badge).toBe("99%");
    expect(view.srLabel).toContain("99% do objetivo");
    expect(view.covered).toBe("o período cobre R$ 49.980 de R$ 50.000");
  });

  it("never divides by a zero target", () => {
    const view = card(noTarget);
    expect(view.percent).toBe(0);
    expect(Number.isNaN(view.percent)).toBe(false);
    expect(view.full).toBe(false);
    expect(view.covered).toBe("o período cobre R$ 0 de R$ 0");
  });

  it("keeps the bar, the badge, the sentence and the tone on ONE quantity", () => {
    // A cap applied to one channel and not another is exactly the bug
    // .squad/learnings.md records, so every shape is checked, not just one.
    // Hoisted: a hook called inside a loop trips Biome's useHookAtTopLevel.
    const overs = [{}, beyond, stalled, noTarget, nearly];
    const views = [
      card(),
      card(beyond),
      card(stalled),
      card(noTarget),
      card(nearly),
    ];
    views.forEach((view, index) => {
      expect(view.badge).toBe(`${view.percent}%`);
      expect(view.srLabel).toContain(`${view.percent}% do objetivo`);
      expect(view.percent).toBeLessThanOrEqual(100);
      expect(view.percent).toBeGreaterThanOrEqual(0);
      expect(view.covered).toContain("o período cobre");
      // What flooring buys: `full` is exactly `accrued >= target`, which is
      // the producer's own condition for doneMonth. Rounding broke this for
      // `nearly` — a green 100% badge beside ALÉM DO PERÍODO.
      expect(view.full).toBe(goal(overs[index]).doneMonth !== null);
    });
  });
});
