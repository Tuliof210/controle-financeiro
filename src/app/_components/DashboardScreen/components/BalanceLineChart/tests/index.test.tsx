import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { BalanceLineChart } from "@/app/_components/DashboardScreen/components/BalanceLineChart/index.tsx";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, income: 1000, expense: 400, cumulative }) as MonthPoint;

const points = [point(202_601, 100), point(202_602, 200)];

const chart = (dashedFrom: number | null, tightest: number | null) =>
  render(
    <BalanceLineChart
      points={points}
      dashedFrom={dashedFrom}
      tightest={tightest}
      width={884}
      height={240}
    />,
  );

const JAN = /Jan\/26 · acumulado/;
const FEB = /Fev\/26 · acumulado/;

describe("BalanceLineChart", () => {
  it("names its own plot region and draws one dot per month", () => {
    chart(null, null);

    expect(
      screen.getByRole("region", {
        name: "Saldo acumulado de cada mês do período",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(JAN)).toBeInTheDocument();
    expect(screen.getByLabelText(FEB)).toBeInTheDocument();
  });

  it("marks the bottleneck month only when the ceiling names one", () => {
    const { unmount } = chart(null, null);

    expect(screen.queryByText("MÊS MAIS APERTADO")).not.toBeInTheDocument();
    unmount();

    chart(null, 202_602);

    expect(screen.getByText("MÊS MAIS APERTADO")).toBeInTheDocument();
  });
});
