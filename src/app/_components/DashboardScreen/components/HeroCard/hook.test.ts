import { describe, expect, it } from "vitest";
import type { MonthPoint, Stats } from "@/app/api/dashboard/types";
import type { BoardData } from "../Board/hook";
import { useHeroCard } from "./hook";

// useHeroCard calls no React hook, so it needs no jsdom and no testing-library.
const STATS: Stats = { total: 0, current: 0, mean: 0, stdDev: 0, median: 0 };
const point = (month: number, cumulative: number): MonthPoint => ({
  month,
  cumulative,
  income: 100000,
  expense: 40000,
  balance: 60000,
  incomeEstimated: false,
  expenseEstimated: false,
});

const board = (points: MonthPoint[], current?: number): BoardData => ({
  status: "ok",
  range: {
    start: points[0].month,
    end: points[points.length - 1].month,
    current: current ?? points[0].month,
  },
  points,
  dashedFrom: null,
  income: STATS,
  expense: STATS,
  balance: STATS,
  slack: [],
  pace: 0,
  limit: { goalCents: null, months: [] },
  goals: [],
});

const redFact = (...points: MonthPoint[]) =>
  useHeroCard({ data: board(points) }).facts[2];

describe("useHeroCard", () => {
  it("reads the projection off the last point and the delta off the current one", () => {
    const points = [point(202601, 10000), point(202602, 30000)];
    const data = board([...points, point(202603, 90000)], 202602);
    const hero = useHeroCard({ data });
    expect(hero.endLabel).toBe("Mar/26");
    expect(hero.value).toBe("R$ 900,00");
    expect(hero.now).toBe("R$ 300,00");
    expect(hero.delta).toBe("R$ 600,00");
    expect(hero.deltaUp).toBe(true);
  });

  it("marks a falling projection with deltaUp false", () => {
    const data = board([point(202601, 90000), point(202602, 20000)], 202601);
    expect(useHeroCard({ data }).deltaUp).toBe(false);
    expect(useHeroCard({ data }).delta).toBe("−R$ 700,00");
  });

  it("falls back to the first point when the payload has no current month", () => {
    // Reachable when the payload and the clock disagree; without the fallback
    // this throws on undefined.cumulative.
    const data = board([point(202601, 5000), point(202602, 8000)], 209912);
    expect(useHeroCard({ data }).now).toBe("R$ 50,00");
    expect(useHeroCard({ data }).delta).toBe("R$ 30,00");
  });

  it("sums the period and averages it per month in the two money facts", () => {
    const data = board([point(202601, 1), point(202602, 2), point(202603, 3)]);
    const [income, expense] = useHeroCard({ data }).facts;
    expect(income).toMatchObject({
      label: "ENTRADAS 3M",
      value: "R$ 3.000",
      sub: "média R$ 1.000/mês",
    });
    expect(expense).toMatchObject({
      label: "SAÍDAS 3M",
      value: "R$ 1.200",
      sub: "média R$ 400/mês",
    });
  });

  it("describes the red months only as precisely as the data allows", () => {
    const [jan, fev, mar] = [202601, 202602, 202603];
    const sub = (...points: MonthPoint[]) => redFact(...points).sub;
    // A contiguous prefix: the run really does end before Mar/26.
    const prefix = [point(jan, -1), point(fev, -1), point(mar, 5)];
    expect(redFact(...prefix)).toMatchObject({
      value: "2",
      sub: "todos antes de Mar/26",
    });
    // A black month before a red one: no honest "todos antes de".
    expect(sub(point(jan, 5), point(fev, -1), point(mar, 5))).toBe(
      "espalhados pelo período",
    );
    // Every month red — no next point, so the month after the last red one.
    expect(sub(point(202611, -2), point(202612, -1))).toBe(
      "todos antes de Jan/27",
    );
    expect(sub(point(jan, 5), point(fev, 9))).toBe("nenhum mês no vermelho");
    expect(redFact(point(jan, 5), point(fev, 9)).value).toBe("0");
  });
});
