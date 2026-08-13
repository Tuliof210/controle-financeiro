import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MonthlyBarChart } from "@/app/_components/DashboardScreen/components/MonthlyBarChart/index.tsx";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number) =>
  ({
    month,
    income: 1000,
    expense: 400,
    cumulative: 600,
    incomeEstimated: false,
    expenseEstimated: false,
    simulated: false,
  }) as MonthPoint;

const points = [point(202_601), point(202_602)];

const chart = (dashedFrom: number | null) =>
  render(
    <MonthlyBarChart
      points={points}
      dashedFrom={dashedFrom}
      width={884}
      height={240}
    />,
  );

// Both bars of a month now share ONE accessible name: it is the whole bubble, so
// it answers for the month rather than for one side of the pair. That is the
// point — entradas and saídas per month exist nowhere else on this screen, and a
// keyboard reader lands on the mark, not on the aria-hidden bubble.
const JAN = /Jan\/26 · real · entradas R\$ 10,00 · saídas R\$ 4,00/;

describe("MonthlyBarChart", () => {
  it("names its own plot and draws both sides of each month", () => {
    chart(null);

    // The name lives on the <svg>'s <title> now: the scroll box carried the same
    // string as an aria-label AND a tab stop, and the chart was named twice.
    expect(
      screen.getByTitle("Entradas e saídas de cada mês do período"),
    ).toBeInTheDocument();
    // One hit target per bar, both naming the same month.
    expect(screen.getAllByLabelText(JAN)).toHaveLength(2);
  });

  it("makes every hit target reachable by keyboard", () => {
    chart(null);

    for (const hit of screen.getAllByLabelText(JAN)) {
      expect(hit).toHaveAttribute("tabindex", "0");
    }
  });

  it("tags the projected region only once there is one", () => {
    const { unmount } = chart(null);

    expect(screen.queryByText("PROJETADO")).not.toBeInTheDocument();
    unmount();

    chart(202_602);

    expect(screen.getByText("PROJETADO")).toBeInTheDocument();
  });
});
