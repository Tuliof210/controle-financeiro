import { describe, expect, it } from "vitest";
import { goal, movement, recurrence } from "./fixtures.helper";
import { buildPayload } from "./payload.helper";

// buildPayload is pure, so this exercises the wiring of all five blocks off one
// dataset without any repository mocks. Each rule has its own unit suite; what
// this catches is a wiring mistake — a swapped argument, a stale `pace`, the
// current month passed where the range start belongs.
const data = buildPayload({
  range: { start: 202601, end: 202603, current: 202602 },
  months: [202601, 202602, 202603],
  currentIndex: 1,
  goalCents: 100000,
  goals: [goal(5000000), goal(100000, "g2")],
  movements: [
    movement(202601, "income", 500000),
    movement(202601, "expense", 200000),
  ],
  recurrences: [
    recurrence([202601, 202602, 202603], "income", 400000),
    recurrence([202601, 202602, 202603], "expense", 100000),
  ],
});

if (data.status !== "ok") throw new Error(`expected ok, got ${data.status}`);

describe("buildPayload", () => {
  it("reconciles each month and runs the cumulative through them", () => {
    // January's actuals beat both commitments; February and March have none.
    expect(data.points.map((p) => p.balance)).toEqual([300000, 300000, 300000]);
    expect(data.points.map((p) => p.cumulative)).toEqual([
      300000, 600000, 900000,
    ]);
    expect(data.dashedFrom).toBe(202602);
  });

  it("splits the statistics at the current month", () => {
    expect(data.balance.total).toBe(900000);
    expect(data.balance.current).toBe(600000); // 202601 + 202602
  });

  it("starts slack at the current month, off the suffix minimum", () => {
    // min(cumulative) over [202602..202603] is 600000; over [202603] it is 900000.
    expect(data.slack).toEqual([
      { month: 202602, total: 480000, weekly: 120000, daily: 16000 },
      { month: 202603, total: 720000, weekly: 180000, daily: 24000 },
    ]);
  });

  it("derives the pace from the tightest slack month and projects the goals", () => {
    expect(data.pace).toBe(120000); // 25% of 480000
    // Soonest first, so the cheap goal overtakes the one declared before it.
    expect(data.goals.map((goal) => goal.id)).toEqual(["g2", "g1"]);
    expect(data.goals[1].months).toBe(42); // ceil(5000000 / 120000)
  });

  it("hands the goals the horizon, not the whole range", () => {
    // The wiring this pins: monthsAhead is slack.length (2 months left), NOT
    // months.length (3), and `current` is range.current (202602), not
    // range.start. 2 * 120000 accrued; Bici needs one month, so it closes in
    // the current month itself.
    expect(data.goals[1].accruedCents).toBe(240000);
    expect(data.goals[0].doneMonth).toBe(202602);
    expect(data.goals[1].doneMonth).toBeNull(); // 42 months, only 2 left
  });

  it("measures every month against the saved ceiling", () => {
    expect(data.limit.goalCents).toBe(100000);
    expect(data.limit.months.map((row) => row.percent)).toEqual([
      200, 100, 100,
    ]);
  });
});
