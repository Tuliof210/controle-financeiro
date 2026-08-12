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

describe("MonthlyBarChart", () => {
  it("names its own plot region and draws both sides of each month", () => {
    chart(null);

    expect(
      screen.getByRole("region", {
        name: "Entradas e saídas de cada mês do período",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Jan/26 · Entradas · R$ 10,00 · lançado"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Jan/26 · Saídas · R$ 4,00 · lançado"),
    ).toBeInTheDocument();
  });

  it("tags the projected region only once there is one", () => {
    const { unmount } = chart(null);

    expect(screen.queryByText("PROJETADO")).not.toBeInTheDocument();
    unmount();

    chart(202_602);

    expect(screen.getByText("PROJETADO")).toBeInTheDocument();
  });
});
