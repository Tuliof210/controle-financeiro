import { describe, expect, it } from "@jest/globals";
import { buildFacts } from "@/app/_components/DashboardScreen/components/HeroBand/hero-band.helper.ts";
import type { DashboardRange, MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

const range: DashboardRange = {
  start: 202_601,
  end: 202_602,
  current: 202_601,
};

// `deltaGlyphFor` used to be tested here. It drove the band's ▲/▼ delta badge,
// which compared a far-end projection against today's balance — arithmetic, not a
// conclusion. The band states a verdict now (hero-verdict.helper.ts).

describe("buildFacts", () => {
  const facts = buildFacts([point(202_601, 100), point(202_602, 200)], range);

  // Demoted from the headline, which is the ceiling now, and FIRST in the strip
  // because it is the figure that used to be the loudest thing on the page.
  it("leads with the projected balance and the month it lands in", () => {
    expect(facts[0]).toMatchObject({
      key: "projected",
      label: "Saldo projetado",
      value: "R$ 2",
      sub: "Fev/26",
    });
  });

  it("totals each side over the range, with its monthly mean", () => {
    expect(facts[1]).toMatchObject({
      key: "income",
      label: "Entradas 2m",
      value: "R$ 20",
      sub: "média R$ 10/mês",
    });
    expect(facts[2]).toMatchObject({ key: "expense", value: "R$ 8" });
  });

  // Sentence case in the source, shouted by text-transform in the stylesheet: an
  // all-caps string reaches a screen reader as an all-caps string, and some
  // voices spell those letter by letter.
  it("keeps every label out of caps at the source", () => {
    for (const fact of facts) {
      expect(fact.label).not.toBe(fact.label.toUpperCase());
    }
  });

  it("says so when no month closes in the red", () => {
    expect(facts[3]).toMatchObject({
      value: "0",
      sub: "nenhum mês no vermelho",
    });
  });

  it("names the month the red run ends before, when it is a prefix", () => {
    const built = buildFacts(
      [point(202_601, -100), point(202_602, 200)],
      range,
    );

    expect(built[3]).toMatchObject({
      value: "1",
      sub: "todos antes de Fev/26",
    });
  });

  it("reads a scattered run as scattered rather than naming a month", () => {
    const built = buildFacts(
      [point(202_601, -100), point(202_602, 200), point(202_603, -50)],
      range,
    );

    expect(built[3].sub).toBe("espalhados pelo período");
  });

  it("names the month after the last red one when the whole range is red", () => {
    const built = buildFacts(
      [point(202_611, -100), point(202_612, -50)],
      range,
    );

    expect(built[3].sub).toBe("todos antes de Jan/27");
  });
});
