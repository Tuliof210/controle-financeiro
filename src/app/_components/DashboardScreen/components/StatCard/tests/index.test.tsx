import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/app/_components/DashboardScreen/components/StatCard/index.tsx";

const stats = {
  total: 1000,
  current: 400,
  mean: 500,
  stdDev: 100,
  median: 450,
};

const props = {
  title: "Saldo",
  icon: "scale" as const,
  hint: "Como o saldo sai",
  stats,
  series: [1, 2, 3],
};

describe("StatCard", () => {
  it("heads the card with its own total and four secondary rows", () => {
    const { container } = render(<StatCard {...props} />);

    expect(screen.getByRole("heading", { name: "Saldo" })).toBeInTheDocument();
    expect(container.querySelector(".total")).toHaveTextContent("R$ 10,00");
    expect(screen.getByText("Desvio padrão")).toBeInTheDocument();
  });

  it("draws the sign arrow only on a signed card", () => {
    const { container, rerender } = render(<StatCard {...props} />);

    expect(container.querySelector(".sign")).toBeNull();

    rerender(<StatCard {...props} signed={true} />);

    expect(container.querySelector(".sign svg")).toBeInTheDocument();
  });

  it("draws the sparkline from the card's own series", () => {
    const { container } = render(<StatCard {...props} />);
    const path = container.querySelector("svg.spark path:last-of-type");

    expect(path).not.toBeNull();
    expect(path).toHaveAttribute("stroke", "var(--color-brand)");
  });

  it("tints the icon chip with the card's own semantic pair", () => {
    const { container, rerender } = render(<StatCard {...props} />);

    expect(container.querySelector(".chipBrand")).not.toBeNull();

    rerender(<StatCard {...props} tone="negative" />);

    expect(container.querySelector(".chipNeutral")).not.toBeNull();
  });

  it("draws no sparkline for an empty series", () => {
    const { container } = render(<StatCard {...props} series={[]} />);

    expect(container.querySelector("svg.spark")).toBeNull();
  });
});
