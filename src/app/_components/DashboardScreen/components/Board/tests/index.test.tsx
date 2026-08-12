import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { Board } from "@/app/_components/DashboardScreen/components/Board/index.tsx";

const OVERVIEW = "overview";
const SAVINGS = "savings";

jest.mock(
  "@/app/_components/DashboardScreen/components/Overview/index.tsx",
  () => ({ Overview: () => <p data-testid="overview" /> }),
);
jest.mock(
  "@/app/_components/DashboardScreen/components/SavingsSection/index.tsx",
  () => ({ SavingsSection: () => <p data-testid="savings" /> }),
);

const data = {
  status: "ok",
  range: { start: 202_608, end: 202_609, current: 202_608 },
  meta: null,
  ceiling: {
    monthly: 250,
    weekly: 62,
    daily: 8,
    tightest: 202_609,
    firstRed: null,
    months: [
      { month: 202_608, budget: 250, ceilingBalance: 1000, ceilingLeft: 750 },
    ],
  },
} as BoardData;

describe("Board", () => {
  it("lays the three sections out in reading order", () => {
    render(<Board data={data} cap="50" onCapChange={jest.fn()} />);

    expect(screen.getByTestId(OVERVIEW)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Teto de Gastos" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId(SAVINGS)).toBeInTheDocument();
  });
});
