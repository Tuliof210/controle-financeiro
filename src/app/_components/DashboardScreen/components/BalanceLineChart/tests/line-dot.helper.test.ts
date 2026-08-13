import { describe, expect, it } from "@jest/globals";
import {
  dotFor,
  tagFor,
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
  it("keys the dot on its month and keeps the coordinates it was given", () => {
    const dot = dotFor(point, false, 12, 34);

    expect(dot.key).toBe(202_608);
    expect(dot.cx).toBe(12);
    expect(dot.cy).toBe(34);
  });

  it("carries the plot x, so the crosshair rides the bubble's own hover", () => {
    expect(dotFor(point, false, 12, 34).tip.plotX).toBe(12);
  });

  it("captions the point with its month and cumulative", () => {
    const { tip } = dotFor(point, true, 0, 0);

    expect(tip.title).toBe("Ago/26");
    expect(tip.tag).toBe("estimado");
    expect(tip.rows[0]).toMatchObject({
      label: "acumulado",
      value: "R$ 50,00",
      tone: "brand",
    });
  });
});
