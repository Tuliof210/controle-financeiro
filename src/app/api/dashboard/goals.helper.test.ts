import { describe, expect, it } from "vitest";
import { goal } from "./fixtures.helper";
import { projectGoals } from "./goals.helper";

// Long enough that nothing bumps into the period's end unless a case says so.
// `current` is July 2026.
const horizon = (pace: number, monthsAhead = 120) => ({
  pace,
  monthsAhead,
  current: 202607,
});

describe("projectGoals — the wait", () => {
  it("rounds a partial month up, and never down to zero", () => {
    expect(projectGoals([goal(2500)], horizon(1000))[0].months).toBe(3);
    expect(projectGoals([goal(1)], horizon(1000))[0].months).toBe(1);
  });

  it("returns null months for every goal when the pace is zero", () => {
    const projected = projectGoals([goal(2500), goal(10, "g2")], horizon(0));
    expect(projected.map((entry) => entry.months)).toEqual([null, null]);
  });

  it("returns an empty list when no goals are saved", () => {
    expect(projectGoals([], horizon(1000))).toEqual([]);
  });
});

describe("projectGoals — the completion month", () => {
  it("counts from the current month, not from the next one", () => {
    // One month of pace closes this month; three land at the end of Sep.
    expect(projectGoals([goal(1000)], horizon(1000))[0].doneMonth).toBe(202607);
    expect(projectGoals([goal(3000)], horizon(1000))[0].doneMonth).toBe(202609);
  });

  it("crosses a year boundary", () => {
    expect(projectGoals([goal(8000)], horizon(1000))[0].doneMonth).toBe(202702);
  });

  it("lands the last funded goal on the period's final month", () => {
    // 10 months ahead of Jul/26 ends in Apr/27 — not one past it.
    const [projected] = projectGoals([goal(10000)], horizon(1000, 10));
    expect(projected.doneMonth).toBe(202704);
  });

  it("has none when the pace is zero", () => {
    expect(projectGoals([goal(2500)], horizon(0))[0].doneMonth).toBeNull();
  });
});

describe("projectGoals — the invariant the card leans on", () => {
  // doneMonth drives the meter's colour AND its length AND the date, so pin
  // them against one another rather than as three independent numbers.
  it("has a completion month exactly when the period funds the target", () => {
    const [closes, misses] = projectGoals(
      [goal(10000), goal(10001, "g2")],
      horizon(1000, 10),
    );
    expect(closes.doneMonth).not.toBeNull();
    expect(closes.accruedCents).toBeGreaterThanOrEqual(closes.targetCents);
    expect(misses.doneMonth).toBeNull();
    expect(misses.accruedCents).toBeLessThan(misses.targetCents);
  });

  it("accrues over the months left, and nothing at all at a zero pace", () => {
    expect(projectGoals([goal(1)], horizon(1000, 7))[0].accruedCents).toBe(
      7000,
    );
    expect(projectGoals([goal(1)], horizon(0, 7))[0].accruedCents).toBe(0);
  });

  it("divides the target over the months left, rounding up to clear it", () => {
    const [projected] = projectGoals([goal(10000)], horizon(500, 3));
    expect(projected.neededCents).toBe(3334); // 3333.33 rounded up
    expect(projected.neededCents * 3).toBeGreaterThanOrEqual(10000);
  });
});

describe("projectGoals — ordering", () => {
  it("puts the soonest goal first and the unreachable ones last", () => {
    const projected = projectGoals(
      [goal(50000, "far"), goal(3000, "near"), goal(90000, "beyond")],
      horizon(1000, 60),
    );
    expect(projected.map((e) => e.id)).toEqual(["near", "far", "beyond"]);
    expect(projected.at(-1)?.doneMonth).toBeNull();
  });

  it("keeps the repository order among ties and when none are reachable", () => {
    const tied = projectGoals(
      [goal(1000, "a"), goal(1000, "b")],
      horizon(1000),
    );
    expect(tied.map((e) => e.id)).toEqual(["a", "b"]);
    const none = projectGoals([goal(10, "a"), goal(20, "b")], horizon(0));
    expect(none.map((e) => e.id)).toEqual(["a", "b"]);
  });
});
