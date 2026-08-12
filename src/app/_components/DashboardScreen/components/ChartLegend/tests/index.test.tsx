import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ChartLegend } from "@/app/_components/DashboardScreen/components/ChartLegend/index.tsx";

describe("ChartLegend", () => {
  it("names each series beside its swatch", () => {
    render(
      <ChartLegend
        items={[
          { key: "income", label: "Entradas", color: "green" },
          { key: "expense", label: "Saídas", color: "red" },
        ]}
      />,
    );

    expect(screen.getByText("Entradas")).toBeInTheDocument();
    expect(screen.getByText("Saídas")).toBeInTheDocument();
  });

  it("falls back to a sentence for a stroke-coded chart", () => {
    render(<ChartLegend note="sólida = realizado · tracejada = projeção" />);

    expect(
      screen.getByText("sólida = realizado · tracejada = projeção"),
    ).toBeInTheDocument();
  });
});
