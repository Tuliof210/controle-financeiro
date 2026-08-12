import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MonthRow } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthTable/components/MonthRow/index.tsx";

const month = {
  month: 202_608,
  incomeCents: 100_000,
  expenseCents: 40_000,
  balanceCents: 60_000,
  count: 12,
};

const inTable = (element: React.ReactElement) =>
  render(
    <table>
      <tbody>{element}</tbody>
    </table>,
  );

describe("MonthRow", () => {
  it("heads the row with its month and lists the four figures", () => {
    inTable(<MonthRow month={month} />);

    expect(screen.getByRole("rowheader")).toHaveTextContent("Ago/26");
    expect(screen.getByText("R$ 1.000,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 400,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 600,00")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("prints a negative balance with the minus sign", () => {
    inTable(<MonthRow month={{ ...month, balanceCents: -100 }} />);

    expect(screen.getByText("−R$ 1,00")).toBeInTheDocument();
  });
});
