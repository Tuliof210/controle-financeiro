import { describe, expect, it } from "vitest";
import type { GoalProjection } from "@/app/api/dashboard/types";
import { etaLabel, noteLabel } from "./timeline.helper";

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

describe("etaLabel", () => {
  it("pairs the pace with where it lands", () => {
    expect(etaLabel(goal())).toBe("~7 MESES · CONCLUI EM Fev/27");
  });

  it("says RITMO ZERO, not '~null meses', when no month leaves slack", () => {
    expect(etaLabel(goal({ months: null, doneMonth: null }))).toBe(
      "RITMO ZERO · ALÉM DO PERÍODO",
    );
  });

  it("marks a goal the period never funds as ALÉM DO PERÍODO", () => {
    // doneMonth null is the producer's only flag for "not inside the range".
    expect(etaLabel(goal({ doneMonth: null }))).toBe(
      "~7 MESES · ALÉM DO PERÍODO",
    );
  });

  it("singularises a one-month wait", () => {
    // "~1 MESES" is not Portuguese; the retired goalLabel singularised too.
    expect(etaLabel(goal({ months: 1 }))).toBe("~1 MÊS · CONCLUI EM Fev/27");
  });
});

describe("noteLabel", () => {
  it("reports the date when the period funds the goal", () => {
    expect(noteLabel(goal())).toBe("conclui em Fev/27 no ritmo atual");
  });

  it("reports the monthly shortfall when it does not", () => {
    expect(noteLabel(goal({ doneMonth: null, neededCents: 416667 }))).toBe(
      "precisaria de R$ 4.166,67/mês para fechar no prazo",
    );
  });
});
