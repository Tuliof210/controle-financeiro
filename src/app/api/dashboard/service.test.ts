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

// Fixed clock (no fake timers in this repo; see src/lib/months.test.ts).
const NOW = new Date(2026, 1, 15); // 202602

// Four mocks share state — unlike a single-repository suite, reset explicitly.
beforeEach(() => vi.clearAllMocks());

describe("getDashboard", () => {
  it("reports no_range when there are no entries anywhere", async () => {
    seed();
    expect(await getDashboard("familia", NOW)).toEqual({ status: "no_range" });
  });

  it("reports out_of_range when the current month falls outside the entries", async () => {
    seed({
      movements: [movement(202501, "income", 1), movement(202512, "income", 1)],
    });
    expect(await getDashboard("familia", NOW)).toEqual({
      status: "out_of_range",
      range: { start: 202501, end: 202512, current: 202602 },
    });
    seed({
      movements: [movement(202701, "income", 1), movement(202712, "income", 1)],
    });
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
    const entries = [
      movement(202601, "income", 100000),
      movement(202601, "income", 900000, "p2"),
    ];
    seed({ movements: entries });
    const january = new Date(2026, 0, 15);
    const mine = await getDashboard("p1", january);
    const family = await getDashboard("familia", january);
    if (mine.status !== "ok" || family.status !== "ok") throw new Error("ok");

    expect(mine.income.total).toBe(100000);
    expect(family.income.total).toBe(1000000);
  });

  it("keeps goals family-wide, ignoring the owner filter", async () => {
    seed({
      movements: [movement(202602, "income", 1)],
      goals: [{ id: "g1", name: "Carro", targetCents: 5000000 }],
    });
    const data = await getDashboard("nobody", NOW);
    if (data.status !== "ok") throw new Error("expected ok");

    expect(data.goals.map((goal) => goal.id)).toEqual(["g1"]);
  });

  // End-to-end wiring of the six blocks lives in payload.helper.test.ts, which
  // calls buildPayload directly — it is pure and needs none of these mocks.
  it("passes the saved monthly ceiling through to the limit block", async () => {
    seed({
      movements: [movement(202602, "income", 1)],
      settings: { monthlyGoalCents: 100000 },
    });
    const data = await getDashboard("familia", NOW);
    if (data.status !== "ok") throw new Error("expected ok");

    expect(data.limit.goalCents).toBe(100000);
  });
});
