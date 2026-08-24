import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen, within } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { HeroBand } from "@/app/_components/DashboardScreen/components/HeroBand/index.tsx";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

const data = {
  points: [point(202_601, 100), point(202_603, 500)],
  range: { start: 202_601, end: 202_603, current: 202_601 },
  ceiling: {
    monthly: 250,
    weekly: 62,
    daily: 8,
    tightest: null,
    firstRed: null,
    months: [],
  },
} as unknown as BoardData;

const TETO = /Teto em/;
const PROJECTED = /Saldo projetado/;
const ENTRADAS = /Entradas/;
const RED_MONTHS = /Meses no vermelho/;
const VS_NOW = /vs\. saldo atual de R\$ 1,00/;

const band = (container: HTMLElement) =>
  within(container.querySelector("section") as HTMLElement);

describe("HeroBand", () => {
  it("titles the screen even before a payload lands", () => {
    render(<HeroBand />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(TETO)).not.toBeInTheDocument();
    expect(screen.queryByText(PROJECTED)).not.toBeInTheDocument();
  });

  it("shows the monthly ceiling as the hero and the projected end as evidence", () => {
    const { container } = render(<HeroBand data={data} />);

    expect(band(container).getByText("Teto em Jan/26.")).toBeInTheDocument();
    expect(container.querySelector(".value")).toHaveTextContent("R$ 2,50");
    expect(container.querySelector(".weekly")).toHaveTextContent(
      "R$ 0,62 por semana",
    );
    expect(
      band(container).getByText("Saldo projetado em Mar/26."),
    ).toBeInTheDocument();
    expect(container.querySelector(".evidence")).toHaveTextContent("R$ 5,00");
    expect(container.querySelector(".value")).not.toHaveTextContent("R$ 5,00");
    expect(band(container).getByText(VS_NOW)).toBeInTheDocument();
  });

  it("does not carry a supporting stats row under the figure", () => {
    render(<HeroBand data={data} />);

    expect(screen.queryByText(ENTRADAS)).not.toBeInTheDocument();
    expect(screen.queryByText(RED_MONTHS)).not.toBeInTheDocument();
  });

  it("marks the band as waiting until its figures are the current ones", () => {
    const { container, rerender } = render(
      <HeroBand data={data} refreshing={true} />,
    );
    const section = () => container.querySelector("section");

    expect(section()).toHaveClass("waiting");

    rerender(<HeroBand data={data} />);
    expect(section()).not.toHaveClass("waiting");

    rerender(<HeroBand />);
    expect(section()).toHaveClass("waiting");
  });
});
