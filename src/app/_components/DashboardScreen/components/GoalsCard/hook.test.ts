import { describe, expect, it } from "vitest";
import type { GoalProjection } from "@/app/api/dashboard/types";
import { useGoalsCard } from "./hook";

const goal = (months: number | null): GoalProjection => ({
  id: "g1",
  name: "Carro",
  targetCents: 5000000,
  months,
});

describe("useGoalsCard", () => {
  it("renders the wait for a reachable goal", () => {
    expect(useGoalsCard({ goals: [goal(7)] }).rows[0]).toEqual({
      key: "g1",
      name: "Carro",
      target: "R$ 50.000,00",
      wait: "~7 meses",
      unreachable: false,
    });
  });

  it("flags an unreachable goal in words, not only in colour", () => {
    const row = useGoalsCard({ goals: [goal(null)] }).rows[0];
    expect(row.wait).toBe("inalcançável no ritmo atual");
    expect(row.unreachable).toBe(true);
  });

  it("goes empty with no goals saved", () => {
    expect(useGoalsCard({ goals: [] }).empty).toBe(true);
  });
});
