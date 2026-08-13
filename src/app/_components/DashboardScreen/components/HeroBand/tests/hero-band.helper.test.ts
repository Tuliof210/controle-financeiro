import { describe, expect, it } from "@jest/globals";
import {
  buildFacts,
  deltaGlyphFor,
} from "@/app/_components/DashboardScreen/components/HeroBand/hero-band.helper.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

describe("deltaGlyphFor", () => {
  it("drives the glyph, so the badge tone can never disagree", () => {
    expect(deltaGlyphFor(true)).toBe("▲");
    expect(deltaGlyphFor(false)).toBe("▼");
  });
});

describe("buildFacts", () => {
  const facts = buildFacts([point(202_601, 100), point(202_602, 200)]);

  it("totals each side over the range, with its monthly mean", () => {
    expect(facts[0]).toMatchObject({
      key: "income",
      label: "ENTRADAS 2M",
      value: "R$ 20",
      sub: "média R$ 10/mês",
    });
    expect(facts[1]).toMatchObject({ key: "expense", value: "R$ 8" });
  });

  it("says so when no month closes in the red", () => {
    expect(facts[2]).toMatchObject({
      value: "0",
      sub: "nenhum mês no vermelho",
    });
  });

  it("names the month the red run ends before, when it is a prefix", () => {
    const built = buildFacts([point(202_601, -100), point(202_602, 200)]);

    expect(built[2]).toMatchObject({
      value: "1",
      sub: "todos antes de Fev/26",
    });
  });

  it("reads a scattered run as scattered rather than naming a month", () => {
    const built = buildFacts([
      point(202_601, -100),
      point(202_602, 200),
      point(202_603, -50),
    ]);

    expect(built[2].sub).toBe("espalhados pelo período");
  });

  it("names the month after the last red one when the whole range is red", () => {
    const built = buildFacts([point(202_611, -100), point(202_612, -50)]);

    expect(built[2].sub).toBe("todos antes de Jan/27");
  });
});
