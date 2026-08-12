import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { HeroBand } from "@/app/_components/DashboardScreen/components/HeroBand/index.tsx";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

const data = {
  points: [point(202_601, 100), point(202_603, 500)],
  range: { start: 202_601, end: 202_603, current: 202_601 },
} as BoardData;

describe("HeroBand", () => {
  it("titles the screen even before a payload lands", () => {
    render(<HeroBand />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/SALDO PROJETADO/)).not.toBeInTheDocument();
  });

  it("shows the projected balance against the current one", () => {
    render(<HeroBand data={data} />);

    expect(screen.getByText("SALDO PROJETADO · Mar/26")).toBeInTheDocument();
    expect(screen.getByText("R$ 5,00")).toBeInTheDocument();
    expect(screen.getByText(/vs. saldo atual de R\$ 1,00/)).toBeInTheDocument();
  });

  it("carries the bottom strip once there are figures", () => {
    render(<HeroBand data={data} />);

    expect(screen.getByText("ENTRADAS 2M")).toBeInTheDocument();
    expect(screen.getByText("MESES NO VERMELHO")).toBeInTheDocument();
  });
});
