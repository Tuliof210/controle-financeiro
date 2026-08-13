import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Scale } from "lucide-react";
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
  icon: Scale,
  hint: "Como o saldo sai",
  stats,
  series: [1, 2, 3],
};

const UP_GLYPH = /▲/;

describe("StatCard", () => {
  it("heads the card with its own total and four secondary rows", () => {
    render(<StatCard {...props} />);

    expect(screen.getByRole("heading", { name: "Saldo" })).toBeInTheDocument();
    expect(screen.getByText("R$ 10,00")).toBeInTheDocument();
    expect(screen.getByText("Desvio padrão")).toBeInTheDocument();
  });

  it("draws the sign glyph only on a signed card", () => {
    const { rerender } = render(<StatCard {...props} />);

    expect(screen.queryByText("▲")).not.toBeInTheDocument();

    rerender(<StatCard {...props} signed={true} />);

    expect(screen.getByText(UP_GLYPH)).toBeInTheDocument();
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

    // The NEUTRAL pair, not the negative one: a normal expense is not red.
    expect(container.querySelector(".chipNeutral")).not.toBeNull();
  });

  it("draws no sparkline for an empty series", () => {
    const { container } = render(<StatCard {...props} series={[]} />);

    expect(container.querySelector("svg.spark")).toBeNull();
  });
});
