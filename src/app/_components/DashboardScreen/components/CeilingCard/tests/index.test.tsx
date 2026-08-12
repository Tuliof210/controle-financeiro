import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { CeilingCard } from "@/app/_components/DashboardScreen/components/CeilingCard/index.tsx";
import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";

const month = (value: number, budget: number) => ({
  month: value,
  budget,
  ceilingBalance: 1000,
  ceilingLeft: 1000 - budget,
});

const ceiling = (over: Partial<Ceiling> = {}) =>
  ({
    monthly: 250,
    weekly: 62,
    daily: 8,
    tightest: 202_612,
    firstRed: null,
    months: [month(202_608, 250), month(202_609, 100)],
    ...over,
  }) as Ceiling;

const card = (over: Partial<Ceiling> = {}) =>
  render(
    <CeilingCard
      ceiling={ceiling(over)}
      meta={null}
      current={202_608}
      cap="50"
      onCapChange={jest.fn()}
    />,
  );

describe("CeilingCard", () => {
  it("heads the card with this month's figure and the two cadences", () => {
    card();

    expect(
      screen.getByRole("heading", { name: "Teto de Gastos" }),
    ).toBeInTheDocument();
    // Twice: the headline and the current month's row.
    expect(screen.getAllByText("R$ 2,50")).toHaveLength(2);
    expect(screen.getByText("Por semana")).toBeInTheDocument();
  });

  it("names the bottleneck month and the month in view", () => {
    card();

    expect(screen.getByText("Limitado por Dez/26")).toBeInTheDocument();
    expect(screen.getByTitle("Mês em curso")).toHaveTextContent("Ago/26");
  });

  it("carries the cap selector in the header band", () => {
    card();

    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("replaces the table with a note when there is no ceiling at all", () => {
    card({
      months: [month(202_608, 0)],
      firstRed: { month: 202_610, shortfall: 500 },
    });

    expect(
      screen.getByText("Sem teto: Out/26 fecha R$ 5,00 no vermelho."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("hides the show-all toggle while the whole list fits", () => {
    card();

    expect(screen.getByText("2 de 2 meses")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Ver todos/ }),
    ).not.toBeInTheDocument();
  });
});
