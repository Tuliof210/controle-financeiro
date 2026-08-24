import { beforeEach, describe, expect, it } from "@jest/globals";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import {
  dashboardPath,
  formatCeilingDelta,
  monthlyFrom,
} from "@/components/EntryScreen/ceiling-delta.helper.ts";

const ok = (monthly: number): DashboardData =>
  ({ status: "ok", ceiling: { monthly } }) as DashboardData;

describe("monthlyFrom", () => {
  it("reads the monthly ceiling from an ok payload", () => {
    expect(monthlyFrom(ok(250))).toBe(250);
  });

  it("returns nothing when the dashboard has no range", () => {
    expect(monthlyFrom({ status: "no_range" })).toBeUndefined();
  });
});

describe("formatCeilingDelta", () => {
  it("joins both figures when the prior read landed", () => {
    expect(formatCeilingDelta(250, 100)).toBe(
      "Teto deste mês: R$ 2,50 → R$ 1,00.",
    );
  });

  it("shows only the new figure when there was no prior read", () => {
    expect(formatCeilingDelta(undefined, 100)).toBe("Teto deste mês: R$ 1,00.");
  });

  it("shows nothing when the later read failed", () => {
    expect(formatCeilingDelta(250, undefined)).toBeUndefined();
  });

  // cap=meta pins the ceiling to the goal, so every save would say "X → X".
  it("stays silent when the write moved nothing", () => {
    expect(formatCeilingDelta(250, 250)).toBeUndefined();
  });
});

describe("dashboardPath", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses the stored cap and simulation view", () => {
    localStorage.setItem("ceiling-cap", "75");
    localStorage.setItem("simulation", "all");

    expect(dashboardPath("familia")).toBe(
      "/api/dashboard?owner=familia&cap=75&simulation=all",
    );
  });

  // Meta, because that is what the dashboard seeds when nothing is stored and
  // a goal exists; the route downgrades it to "50" when there is no goal.
  it("falls back to the cap the dashboard would seed", () => {
    localStorage.clear();

    expect(dashboardPath("p1")).toBe(
      "/api/dashboard?owner=p1&cap=meta&simulation=real",
    );
  });
});
