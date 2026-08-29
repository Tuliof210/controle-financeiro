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

const PROJECTED = /Saldo projetado/;
const ENTRADAS = /Entradas/;
const RED_MONTHS = /Meses no vermelho/;

describe("HeroBand", () => {
  it("titles the screen even before a payload lands", () => {
    render(<HeroBand />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(PROJECTED)).not.toBeInTheDocument();
  });

  it("does not carry the projected balance or a stats row", () => {
    const { container } = render(<HeroBand data={data} />);

    expect(screen.queryByText(PROJECTED)).not.toBeInTheDocument();
    expect(screen.queryByText(ENTRADAS)).not.toBeInTheDocument();
    expect(screen.queryByText(RED_MONTHS)).not.toBeInTheDocument();
    expect(container.querySelector(".edge")).toBeNull();
    expect(container.querySelector(".glow")).toBeNull();
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
