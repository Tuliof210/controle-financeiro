import "@testing-library/jest-dom/jest-globals";
import { beforeAll, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { Overview } from "@/app/_components/DashboardScreen/components/Overview/index.tsx";

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
  points: [
    {
      month: 202_601,
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
  ceiling: { tightest: null },
} as BoardData;

describe("Overview", () => {
  it("does not render the period facts card as a KPI row", () => {
    render(<Overview data={data} />);

    expect(
      screen.queryByRole("heading", { name: "No período" }),
    ).not.toBeInTheDocument();
  });

  it("renders both chart cards, each with its own legend", () => {
    render(<Overview data={data} />);

    expect(
      screen.getByRole("heading", { name: "Evolução mensal" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Saldo acumulado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("sólida = realizado · tracejada = projeção"),
    ).toBeInTheDocument();
  });
});
