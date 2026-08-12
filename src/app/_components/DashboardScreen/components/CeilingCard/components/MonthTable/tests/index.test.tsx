import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MonthTable } from "@/app/_components/DashboardScreen/components/CeilingCard/components/MonthTable/index.tsx";

const rows = [
  {
    key: 202_608,
    label: "Ago/26",
    isCurrent: true,
    balance: "R$ 10,00",
    spend: "R$ 2,50",
    left: "R$ 7,50",
    share: 0.25,
  },
  {
    key: 202_609,
    label: "Set/26",
    isCurrent: false,
    balance: "R$ 7,50",
    spend: "R$ 1,00",
    left: "R$ 6,50",
    share: 0.13,
  },
];

describe("MonthTable", () => {
  it("captions the table and names its four columns", () => {
    render(<MonthTable rows={rows} />);

    expect(
      screen.getByRole("table", {
        name: "Saldo acumulado mês a mês, se cada mês gastar o seu teto",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
  });

  it("marks the current month, and only it", () => {
    render(<MonthTable rows={rows} />);

    expect(screen.getAllByText("Atual")).toHaveLength(1);
  });

  it("heads each row with its month and lists the three figures", () => {
    render(<MonthTable rows={rows} />);

    expect(
      screen.getByRole("rowheader", { name: /Ago\/26/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("R$ 7,50")).toHaveLength(2);
  });
});
