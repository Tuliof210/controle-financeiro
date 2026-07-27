import { describe, expect, it } from "vitest";
import type { GoalProjection } from "@/app/api/dashboard/types";
import { useGoalCard } from "./hook";

// doneMonth is non-null exactly when accruedCents reaches targetCents; the
// producer guarantees it and these fixtures honour it. The default overshoots.
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

describe("useGoalCard", () => {
  it("reads a fully covered goal as 100%, full, and capped in words", () => {
    const view = card();
    expect(view.percent).toBe(100);
    expect(view.full).toBe(true);
    expect(view.badge).toBe("100%");
    // Capped: "R$ 15.000 de R$ 12.000" beside a full bar would read as a bug.
    expect(view.covered).toBe("o período cobre R$ 12.000 de R$ 12.000");
    expect(view.eta).toBe("~7 MESES · CONCLUI EM Fev/27");
    expect(view.note).toBe("conclui em Fev/27 no ritmo atual");
    expect(view.srLabel).toBe(
      "Viagem para o Chile: o período cobre 100% do objetivo",
    );
  });

  it("reads a partly covered goal at its true share", () => {
    const view = card({
      name: "Reserva de emergência",
      targetCents: 5000000,
      months: 28,
      doneMonth: null,
      accruedCents: 1250000,
      neededCents: 277778,
    });
    expect(view.percent).toBe(25);
    expect(view.full).toBe(false);
    expect(view.badge).toBe("25%");
    expect(view.covered).toBe("o período cobre R$ 12.500 de R$ 50.000");
    expect(view.eta).toBe("~28 MESES · ALÉM DO PERÍODO");
    expect(view.note).toBe(
      "precisaria de R$ 2.777,78/mês para fechar no prazo",
    );
  });

  it("says RITMO ZERO, not '~null meses', when no month leaves slack", () => {
    const view = card(stalled);
    expect(view.eta).toBe("RITMO ZERO · ALÉM DO PERÍODO");
    expect(view.percent).toBe(0);
    expect(view.full).toBe(false);
    expect(view.note).toBe(
      "precisaria de R$ 1.500,00/mês para fechar no prazo",
    );
  });

  it("marks a goal the period never funds as ALÉM DO PERÍODO", () => {
    // doneMonth null is the producer's only flag for "not inside the range".
    expect(card(beyond).eta).toBe("~7 MESES · ALÉM DO PERÍODO");
    // "~1 MESES" is not Portuguese; the retired goalLabel singularised too.
    expect(card({ months: 1 }).eta).toBe("~1 MÊS · CONCLUI EM Fev/27");
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
    // Hoisted out of the loop: a hook called inside one trips Biome's
    // useHookAtTopLevel, which reads it as a conditional call.
    const views = [card(), card(beyond), card(stalled), card(noTarget)];
    for (const view of views) {
      expect(view.badge).toBe(`${view.percent}%`);
      expect(view.srLabel).toContain(`${view.percent}% do objetivo`);
      expect(view.full).toBe(view.percent >= 100);
      expect(view.percent).toBeLessThanOrEqual(100);
      expect(view.percent).toBeGreaterThanOrEqual(0);
      expect(view.covered).toContain("o período cobre");
    }
  });
});
