import "@testing-library/jest-dom/jest-globals";
import { beforeAll, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { Board } from "@/app/_components/DashboardScreen/components/Board/index.tsx";

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {
      // Nothing to observe without layout.
    }
    disconnect() {
      // Nothing to release either.
    }
  } as unknown as typeof ResizeObserver;
  Element.prototype.getBoundingClientRect = () =>
    ({ width: 884, height: 240 }) as DOMRect;
});

const stats = {
  total: 1000,
  current: 400,
  mean: 500,
  stdDev: 100,
  median: 450,
};

const data = {
  status: "ok",
  range: { start: 202_608, end: 202_609, current: 202_608 },
  points: [
    {
      month: 202_608,
      income: 1000,
      expense: 400,
      balance: 600,
      cumulative: 600,
      incomeEstimated: false,
      expenseEstimated: false,
    },
  ],
  dashedFrom: null,
  income: stats,
  expense: stats,
  balance: stats,
  ceiling: {
    monthly: 250,
    weekly: 62,
    daily: 8,
    tightest: 202_609,
    firstRed: null,
    fixed: false,
    headroomCents: 0,
    months: [
      { month: 202_608, budget: 250, ceilingBalance: 1000, ceilingLeft: 750 },
    ],
  },
  overHeadroom: false,
  pace: 0,
  goals: [],
} as BoardData;

const HEADINGS = [
  "No período",
  "Evolução mensal",
  "Saldo acumulado",
  "Teto de gastos",
  "Capacidade de poupança",
];

describe("Board", () => {
  it("lays the sections out in reading order", () => {
    render(<Board data={data} />);

    const hero = screen.getByText(/Saldo projetado em/);
    const facts = screen.getByRole("heading", { name: HEADINGS[0] });
    const following = Node.DOCUMENT_POSITION_FOLLOWING;
    expect(hero.compareDocumentPosition(facts) & following).toBe(following);
    const titles = screen.getAllByRole("heading").map((node) => node.textContent);
    expect(titles).toEqual(HEADINGS);
  });
});
