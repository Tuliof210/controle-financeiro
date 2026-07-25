import { describe, expect, it } from "vitest";
import { movement, recurrence } from "./fixtures.helper";
import { buildPayload } from "./payload.helper";

// buildPayload is pure, so this exercises the wiring of all six blocks off one
// dataset without any repository mocks. Each rule has its own unit suite; what
// this catches is a wiring mistake — a swapped argument, a stale `pace`, the
// current month passed where the range start belongs.
const data = buildPayload({
  range: { start: 202601, end: 202603, current: 202602 },
  months: [202601, 202602, 202603],
  currentIndex: 1,
  goalCents: 100000,
  goals: [
    { id: "g1", name: "Carro", targetCents: 5000000, createdAt: new Date(0) },
  ],
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
    expect(data.goals[0].months).toBe(42); // ceil(5000000 / 120000)
  });

  it("measures every month against the saved ceiling", () => {
    expect(data.limit.goalCents).toBe(100000);
    expect(data.limit.months.map((row) => row.percent)).toEqual([
      200, 100, 100,
    ]);
  });

  it("scores coverage over elapsed months only", () => {
    // January recorded more than it committed on both sides; February recorded
    // nothing against 500000. March is ahead of the current month.
    expect(data.coverage).toMatchObject({
      committed: 1000000,
      recorded: 500000,
      percent: 50,
      months: [{ month: 202602, gap: 500000 }],
    });
  });
});
