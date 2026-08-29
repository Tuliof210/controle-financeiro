import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ProjectedBalance } from "@/app/_components/DashboardScreen/components/Board/components/ProjectedBalance/index.tsx";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

const data = {
  points: [point(202_601, 100), point(202_603, 500)],
  range: { start: 202_601, end: 202_603, current: 202_601 },
} as BoardData;

const ENTRADAS = /Entradas/;
const RED_MONTHS = /Meses no vermelho/;
const VS_NOW = /vs\. saldo atual de R\$ 1,00/;

describe("ProjectedBalance", () => {
  it("shows the projected balance against the current one", () => {
    const { container } = render(<ProjectedBalance data={data} />);

    expect(
      screen.getByText("Saldo projetado em Mar/26."),
    ).toBeInTheDocument();
    expect(container.querySelector(".value")).toHaveTextContent("R$ 5,00");
    expect(screen.getByText(VS_NOW)).toBeInTheDocument();
  });

  it("does not carry a supporting stats row under the figure", () => {
    render(<ProjectedBalance data={data} />);

    expect(screen.queryByText(ENTRADAS)).not.toBeInTheDocument();
    expect(screen.queryByText(RED_MONTHS)).not.toBeInTheDocument();
  });
});
