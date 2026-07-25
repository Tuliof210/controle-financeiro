import { describe, expect, it } from "vitest";
import type { GoalProjection } from "@/app/api/dashboard/types";
import { useGoalsCard } from "./hook";

// The producer guarantees doneMonth is non-null exactly when accruedCents
// reaches targetCents; these fixtures honour it, since the card leans on it.
const goal = (over: Partial<GoalProjection> = {}): GoalProjection => ({
  id: "g1",
  name: "Carro",
  targetCents: 5000000,
  months: 7,
  doneMonth: 202702,
  accruedCents: 6000000, // overshoots the target
  neededCents: 500000,
  ...over,
});

// 49 months out, a quarter of it funded by the end of the period.
const late = () =>
  goal({
    id: "g2",
    name: "Casa",
    months: 49,
    doneMonth: null,
    accruedCents: 1250000,
    neededCents: 416667,
  });

const stalled = () =>
  goal({ id: "g3", months: null, doneMonth: null, accruedCents: 0 });

const card = (goals: GoalProjection[], pace = 1035000) =>
  useGoalsCard({ goals, pace });

describe("useGoalsCard", () => {
  it("headlines the saving pace, with or without goals", () => {
    expect(card([]).headline).toBe("R$ 10.350,00");
    expect(card([]).empty).toBe(true);
    expect(card([], 0).headline).toBe("R$ 0,00");
  });

  it("keeps the order the producer sorted the goals into", () => {
    const keys = card([late(), goal()]).rows.map((row) => row.key);
    expect(keys).toEqual(["g2", "g1"]);
  });

  it("reads a funded goal green, dated, and asking for nothing more", () => {
    expect(card([goal()]).rows[0]).toEqual({
      key: "g1",
      name: "Carro",
      percent: 100,
      tone: "positive",
      // Capped at the target: "R$ 60.000 de R$ 50.000" beside a full bar
      // would read as a bug.
      funded: "R$ 50.000 de R$ 50.000",
      wait: "~7 meses",
      unreachable: false,
      done: "conclui em Fev/27",
      needed: null,
      srLabel: "Carro: 100% do objetivo financiado até o fim do período",
    });
  });

  it("reads an underfunded goal red, in words, with the monthly shortfall", () => {
    const row = card([late()]).rows[0];
    expect(row.tone).toBe("negative");
    expect(row.percent).toBe(25); // 1.250.000 of 5.000.000
    expect(row.done).toBe("além do período");
    expect(row.needed).toBe("precisaria de R$ 4.166,67/mês");
    expect(row.wait).toBe("~49 meses");
  });

  it("calls a stalled goal out of reach, not merely late, and drops its date", () => {
    const row = card([stalled()], 0).rows[0];
    expect(row.percent).toBe(0);
    expect(row.unreachable).toBe(true);
    expect(row.wait).toBe("inalcançável no ritmo atual");
    expect(row.needed).toBe("precisaria de R$ 5.000,00/mês");
    // "inalcançável" already says it lands nowhere; a date beside it is noise.
    expect(row.done).toBeNull();
  });

  it("is green only where the bar is full, red only where it is not", () => {
    // Hoisted out of the loop: a hook called inside one trips Biome's
    // useHookAtTopLevel, which reads it as a conditional call.
    const { rows } = card([goal(), late(), stalled()]);
    for (const row of rows) {
      expect(row.tone === "positive").toBe(row.percent === 100);
    }
  });

  it("never announces 100% on a goal the period does not close", () => {
    // 99.96% funded and still short: rounding announced "100%" beside a red
    // bar reading "além do período". The floor is what stops that.
    const row = card([goal({ doneMonth: null, accruedCents: 4998000 })])
      .rows[0];
    expect(row.tone).toBe("negative");
    expect(row.srLabel).toContain("99%");
  });
});
