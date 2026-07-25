import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/infra/repositories/settings.prisma.repository", () => ({
  settingsRepository: { get: vi.fn(), save: vi.fn() },
}));
vi.mock("@/infra/repositories/movement.prisma.repository", () => ({
  movementRepository: { list: vi.fn() },
}));
vi.mock("@/infra/repositories/recurrence.prisma.repository", () => ({
  recurrenceRepository: { list: vi.fn() },
}));
vi.mock("@/infra/repositories/goal.prisma.repository", () => ({
  goalRepository: { list: vi.fn() },
}));

import { movement, recurrence } from "./fixtures.helper";
import { getDashboard } from "./service";
import { seed } from "./service.test.helper";

// Fixed clock: currentYYYYMM would otherwise read the real date. This repo has
// no fake timers and injects a Date instead (see src/lib/months.test.ts).
const NOW = new Date(2026, 1, 15); // 202602

// Four separate vi.mock factories share state across tests, so unlike the
// single-repository service suites this one needs an explicit reset.
beforeEach(() => vi.clearAllMocks());

describe("getDashboard", () => {
  it("reports no_range when a bound is unset", async () => {
    seed({ settings: { rangeStart: null, rangeEnd: 202612 } });
    expect(await getDashboard("familia", NOW)).toEqual({ status: "no_range" });
  });

  it("reports no_range when the stored range is inverted", async () => {
    seed({ settings: { rangeStart: 202612, rangeEnd: 202601 } });
    expect(await getDashboard("familia", NOW)).toEqual({ status: "no_range" });
  });

  it("reports out_of_range when the current month is past the range end", async () => {
    seed({ settings: { rangeStart: 202501, rangeEnd: 202512 } });
    expect(await getDashboard("familia", NOW)).toEqual({
      status: "out_of_range",
      range: { start: 202501, end: 202512, current: 202602 },
    });
  });

  it("reports out_of_range when the current month precedes the range start", async () => {
    seed({ settings: { rangeStart: 202701, rangeEnd: 202712 } });
    expect(await getDashboard("familia", NOW)).toMatchObject({
      status: "out_of_range",
    });
  });

  it("reconciles both sides and splits the range at the current month", async () => {
    seed({
      movements: [movement(202601, "income", 700000)],
      recurrences: [recurrence([202601, 202602, 202603], "income", 500000)],
    });
    const data = await getDashboard("familia", NOW);
    if (data.status !== "ok") throw new Error("expected ok");

    expect(data.points.map((p) => p.income)).toEqual([700000, 500000, 500000]);
    expect(data.income.total).toBe(1700000);
    expect(data.income.current).toBe(1200000); // 202601 + 202602
    expect(data.dashedFrom).toBe(202602);
  });

  it("restricts the board to one person when owner is a person id", async () => {
    seed({
      movements: [
        movement(202601, "income", 100000),
        movement(202601, "income", 900000, "p2"),
      ],
    });
    const mine = await getDashboard("p1", NOW);
    const family = await getDashboard("familia", NOW);
    if (mine.status !== "ok" || family.status !== "ok") throw new Error("ok");

    expect(mine.income.total).toBe(100000);
    expect(family.income.total).toBe(1000000);
  });

  it("keeps goals family-wide, ignoring the owner filter", async () => {
    seed({ goals: [{ id: "g1", name: "Carro", targetCents: 5000000 }] });
    const data = await getDashboard("nobody", NOW);
    if (data.status !== "ok") throw new Error("expected ok");

    expect(data.goals.map((goal) => goal.id)).toEqual(["g1"]);
  });

  // End-to-end wiring of the six blocks lives in payload.helper.test.ts, which
  // calls buildPayload directly — it is pure and needs none of these mocks.
  it("passes the saved monthly ceiling through to the limit block", async () => {
    seed({ settings: { monthlyGoalCents: 100000 } });
    const data = await getDashboard("familia", NOW);
    if (data.status !== "ok") throw new Error("expected ok");

    expect(data.limit.goalCents).toBe(100000);
  });
});
