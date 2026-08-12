import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MonthTable } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthTable/index.tsx";

const rows = [
  {
    month: 202_608,
    incomeCents: 100_000,
    expenseCents: 40_000,
    balanceCents: 60_000,
    count: 12,
  },
  {
    month: 202_609,
    incomeCents: 0,
    expenseCents: 0,
    balanceCents: 0,
    count: 0,
  },
];

const totals = {
  income: "R$ 1.000,00",
  expense: "R$ 400,00",
  balance: "R$ 600,00",
  count: 12,
  negative: false,
};

describe("MonthTable", () => {
  it("captions the table and names its five columns", () => {
    render(<MonthTable rows={rows} totals={totals} />);

    expect(
      screen.getByRole("table", { name: "Entradas e saídas por mês" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(5);
  });

  it("renders one row per month, plus the totals row", () => {
    render(<MonthTable rows={rows} totals={totals} />);

    expect(
      screen.getByRole("rowheader", { name: "Ago/26" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "Set/26" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "Total" }),
    ).toBeInTheDocument();
  });
});
