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
} as BoardData;

const PROJECTED_LABEL = /SALDO PROJETADO/;
const VS_NOW = /vs\. saldo atual de R\$ 1,00/;

// The band and its sticky echo both carry the projected balance, so every
// assertion about the band's own copy has to say WHICH of the two it means.
const band = (container: HTMLElement) =>
  within(container.querySelector("section") as HTMLElement);

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

    expect(
      band(container).getByText("SALDO PROJETADO · Mar/26"),
    ).toBeInTheDocument();
    // toHaveTextContent, not getByText: the figure is two text nodes now — its
    // cents are their own dimmed span — and getByText reads only an element's
    // DIRECT text children.
    expect(container.querySelector(".value")).toHaveTextContent("R$ 5,00");
    expect(band(container).getByText(VS_NOW)).toBeInTheDocument();
  });

  it("carries the bottom strip once there are figures", () => {
    const { container } = render(<HeroBand data={data} />);

    expect(band(container).getByText("ENTRADAS 2M")).toBeInTheDocument();
    expect(band(container).getByText("MESES NO VERMELHO")).toBeInTheDocument();
  });

  it("echoes the answer in a bar the screen reader never hears twice", () => {
    const { container } = render(<HeroBand data={data} />);
    const bar = container.querySelector("[aria-hidden='true']:not(section *)");

    expect(bar).toHaveTextContent("SALDO PROJETADO · Mar/26");
    expect(bar).toHaveTextContent("R$ 5,00");
    expect(bar).toHaveTextContent("▲ R$ 4,00");
  });

  it("renders no echo while the payload has not landed", () => {
    const { container } = render(<HeroBand />);

    expect(
      container.querySelector("[aria-hidden='true']:not(section *)"),
    ).toBeNull();
  });
});
