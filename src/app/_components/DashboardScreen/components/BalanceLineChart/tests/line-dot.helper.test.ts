import { describe, expect, it } from "@jest/globals";
import {
  dotFor,
  tagFor,
  tetoDotFor,
} from "@/app/_components/DashboardScreen/components/BalanceLineChart/line-dot.helper.ts";

const point = {
  month: 202_608,
  income: 1000,
  expense: 400,
  balance: 600,
  cumulative: 5000,
  incomeEstimated: false,
  expenseEstimated: false,
};

describe("tagFor", () => {
  it("says the projection in words, both ways", () => {
    expect(tagFor(false)).toBe("real");
    expect(tagFor(true)).toBe("estimado");
  });
});

describe("dotFor", () => {
  it("keys the dot on its month and series and keeps the coordinates", () => {
    const dot = dotFor(point, false, 12, 34);

    expect(dot.key).toBe("202608-cumulative");
    expect(dot.cx).toBe(12);
    expect(dot.cy).toBe(34);
  });

  it("carries the plot x, so the crosshair rides the bubble's own hover", () => {
    expect(dotFor(point, false, 12, 34).tip.plotX).toBe(12);
  });

  it("captions the point with its month and cumulative", () => {
    const { tip, title } = dotFor(point, true, 0, 0);

    expect(tip.title).toBe("Ago/26");
    expect(tip.tag).toBe("estimado");
    expect(tip.rows).toEqual([
      {
        key: "cumulative",
        label: "acumulado",
        value: "R$ 50,00",
        tone: "brand",
      },
    ]);
    expect(title).toBe("Ago/26 · acumulado R$ 50,00");
  });

  it("adds the teto row when that month has a ceilingLeft", () => {
    const { tip } = dotFor(point, false, 0, 0, 3000);

    expect(tip.rows).toEqual([
      {
        key: "cumulative",
        label: "acumulado",
        value: "R$ 50,00",
        tone: "brand",
      },
      {
        key: "teto",
        label: "se gastar o teto",
        value: "R$ 30,00",
        tone: "neutral",
      },
    ]);
  });
});

describe("tetoDotFor", () => {
  it("names its own series and shares the two-row tip", () => {
    const { key, title, tip } = tetoDotFor(202_608, 3000, false, 8, 16, 5000);

    expect(key).toBe("202608-teto");
    expect(title).toBe("Ago/26 · se gastar o teto R$ 30,00");
    expect(tip.rows).toHaveLength(2);
    expect(tip.plotX).toBe(8);
  });
});
