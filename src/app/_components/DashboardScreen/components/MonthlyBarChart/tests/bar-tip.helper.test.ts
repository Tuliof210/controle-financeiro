import { describe, expect, it } from "@jest/globals";
import {
  tagFor,
  tipFor,
} from "@/app/_components/DashboardScreen/components/MonthlyBarChart/bar-tip.helper.ts";

const point = {
  month: 202_608,
  income: 1000,
  expense: 400,
  balance: 600,
  cumulative: 5000,
  incomeEstimated: false,
  expenseEstimated: false,
  simulated: false,
};

describe("tagFor", () => {
  it("calls a fully recorded month real", () => {
    expect(tagFor(point)).toBe("real");
  });

  it("calls the month estimated when EITHER side is a projection", () => {
    expect(tagFor({ ...point, incomeEstimated: true })).toBe("estimado");
    expect(tagFor({ ...point, expenseEstimated: true })).toBe("estimado");
  });
});

describe("tipFor", () => {
  it("captions the month with its three formatted figures", () => {
    const tip = tipFor(point);

    expect(tip.title).toBe("Ago/26");
    expect(tip.rows.map((row) => row.label)).toEqual([
      "entradas",
      "saídas",
      "saldo do mês",
    ]);
    expect(tip.rows.map((row) => row.value)).toEqual([
      "R$ 10,00",
      "R$ 4,00",
      "R$ 6,00",
    ]);
  });

  it("accents only a negative month, and leaves the magnitudes neutral", () => {
    expect(tipFor(point).rows[2].tone).toBe("neutral");
    expect(tipFor({ ...point, balance: -1 }).rows[2].tone).toBe("negative");
  });

  it("takes `balance` off the payload rather than re-deriving it", () => {
    // income - expense would be 600 here; the payload says otherwise and the
    // payload wins, which is what this asserts.
    expect(tipFor({ ...point, balance: 999 }).rows[2].value).toBe("R$ 9,99");
  });
});
