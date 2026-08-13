import { describe, expect, it } from "@jest/globals";
import { verdictFor } from "@/app/_components/DashboardScreen/components/HeroBand/hero-verdict.helper.ts";
import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";

const ceiling = (over: Partial<Ceiling> = {}) =>
  ({
    monthly: 386_030,
    weekly: 96_507,
    daily: 12_867,
    tightest: 202_608,
    firstRed: null,
    months: [],
    ...over,
  }) as Ceiling;

describe("verdictFor", () => {
  it("says there is room, and which month bounds it", () => {
    expect(verdictFor(ceiling(), null, "50")).toEqual({
      tone: "positive",
      sentence: "Dá para gastar sem nenhum mês fechar negativo.",
      limit: "Limitado por Ago/26",
    });
  });

  // A zero ceiling with no red month is a different statement from a red month:
  // nothing is broken yet, there is simply nothing spare.
  it("separates a zero ceiling from a month already underwater", () => {
    const verdict = verdictFor(
      ceiling({ monthly: 0, tightest: 202_608 }),
      null,
      "50",
    );

    expect(verdict.tone).toBe("caution");
    expect(verdict.sentence).toBe("Nenhum gasto extra cabe neste mês.");
    expect(verdict.limit).toBe("Limitado por Ago/26");
  });

  // `firstRed !== null` implies `monthly === 0` (ceiling.types.ts), and this
  // branch must win over the zero branch — it names the deadline to act on.
  it("names the month and the shortfall when one is already in the red", () => {
    const verdict = verdictFor(
      ceiling({ monthly: 0, firstRed: { month: 202_611, shortfall: 45_000 } }),
      null,
      "50",
    );

    expect(verdict.tone).toBe("negative");
    expect(verdict.sentence).toBe("Nov/26 já fecha R$ 450,00 no vermelho.");
    // Nothing is limiting a ceiling that does not exist.
    expect(verdict.limit).toBeNull();
  });

  // The goal wins the label when both it and a month are the limit: the reader
  // just chose it. Same predicate the card uses, not a second copy.
  it("credits the goal when the goal is what bound the figure", () => {
    const verdict = verdictFor(ceiling({ monthly: 300_000 }), 300_000, "meta");

    expect(verdict.limit).toBe("Limitado pela meta");
  });

  it("credits the month when the cap is not the goal", () => {
    const verdict = verdictFor(ceiling({ monthly: 300_000 }), 300_000, "75");

    expect(verdict.limit).toBe("Limitado por Ago/26");
  });

  it("offers no limit label when there is no bottleneck at all", () => {
    expect(
      verdictFor(ceiling({ tightest: null }), null, "50").limit,
    ).toBeNull();
  });
});
