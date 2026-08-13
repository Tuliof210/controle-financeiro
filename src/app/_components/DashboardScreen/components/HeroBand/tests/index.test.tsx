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

const PROJECTED_LABEL = /SALDO PROJETADO/;
const VS_NOW = /vs\. saldo atual de R\$ 1,00/;

describe("HeroBand", () => {
  it("titles the screen even before a payload lands", () => {
    render(<HeroBand />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(PROJECTED_LABEL)).not.toBeInTheDocument();
  });

  it("shows the projected balance against the current one", () => {
    const { container } = render(<HeroBand data={data} />);

    expect(screen.getByText("SALDO PROJETADO · Mar/26")).toBeInTheDocument();
    // toHaveTextContent, not getByText: the figure is two text nodes now — its
    // cents are their own dimmed span — and getByText reads only an element's
    // DIRECT text children.
    expect(container.querySelector(".value")).toHaveTextContent("R$ 5,00");
    expect(screen.getByText(VS_NOW)).toBeInTheDocument();
  });

  it("carries the bottom strip once there are figures", () => {
    render(<HeroBand data={data} />);

    expect(screen.getByText("ENTRADAS 2M")).toBeInTheDocument();
    expect(screen.getByText("MESES NO VERMELHO")).toBeInTheDocument();
  });
});
