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
  ceiling: {
    monthly: 386_030,
    weekly: 96_507,
    daily: 12_867,
    tightest: 202_608,
    firstRed: null,
    months: [],
  },
  meta: null,
} as unknown as BoardData;

const CEILING_LABEL = /Teto deste mês/;

describe("HeroBand", () => {
  it("titles the screen even before a payload lands", () => {
    render(<HeroBand cap="50" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(CEILING_LABEL)).not.toBeInTheDocument();
  });

  // The headline is the ceiling. It used to be a projection 29 months out, which
  // was the loudest figure on the page and the least useful one for the decision
  // the page exists to support.
  it("heads the band with this month's ceiling, labelled", () => {
    const { container } = render(<HeroBand data={data} cap="50" />);

    expect(screen.getByText("Teto deste mês")).toBeInTheDocument();
    // toHaveTextContent, not getByText: the figure is two text nodes — its cents
    // are their own dimmed span — and getByText reads only DIRECT text children.
    expect(container.querySelector(".value")).toHaveTextContent("R$ 3.860,30");
  });

  // The label and the figure are a <dt>/<dd> pair now. They were two sibling
  // <p>s, so the screen's biggest figure was its only unlabelled one.
  it("ties the caption to the figure programmatically", () => {
    const { container } = render(<HeroBand data={data} cap="50" />);

    expect(container.querySelector("dl > dt")).toHaveTextContent(
      "Teto deste mês",
    );
    expect(container.querySelector("dl > dd")).toHaveTextContent("R$ 3.860,30");
  });

  it("states the verdict and what bounds it", () => {
    render(<HeroBand data={data} cap="50" />);

    expect(
      screen.getByText("Dá para gastar sem nenhum mês fechar negativo."),
    ).toBeInTheDocument();
    expect(screen.getByText("Limitado por Ago/26")).toBeInTheDocument();
  });

  it("carries the bottom strip once there are figures", () => {
    render(<HeroBand data={data} cap="50" />);

    expect(screen.getByText("Saldo projetado")).toBeInTheDocument();
    expect(screen.getByText("Entradas 2m")).toBeInTheDocument();
    expect(screen.getByText("Meses no vermelho")).toBeInTheDocument();
  });
});
