import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ChartTooltip } from "@/app/_components/DashboardScreen/components/ChartTooltip/index.tsx";

const tooltip = {
  x: 10,
  y: 20,
  title: "Ago/26",
  tag: "estimado",
  rows: [
    {
      key: "income",
      label: "entradas",
      value: "R$ 10,00",
      tone: "positive" as const,
    },
    {
      key: "balance",
      label: "saldo do mês",
      value: "−R$ 4,00",
      tone: "negative" as const,
    },
  ],
};

describe("ChartTooltip", () => {
  it("renders nothing while no mark is hovered", () => {
    const { container } = render(<ChartTooltip tooltip={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("heads the bubble with the month and its own labelled figures", () => {
    render(<ChartTooltip tooltip={tooltip} />);
    const bubble = screen.getByRole("tooltip");

    expect(bubble).toHaveTextContent("Ago/26");
    expect(bubble).toHaveTextContent("entradas");
    expect(bubble).toHaveTextContent("−R$ 4,00");
  });

  it("says real or estimated in words, never by colour alone", () => {
    render(<ChartTooltip tooltip={tooltip} />);

    expect(screen.getByText("estimado")).toBeInTheDocument();
  });

  it("tints a value row through the explicit tone map", () => {
    const { container } = render(<ChartTooltip tooltip={tooltip} />);

    expect(container.querySelector(".negative")).not.toBeNull();
    expect(container.querySelector(".positive")).not.toBeNull();
  });
});
