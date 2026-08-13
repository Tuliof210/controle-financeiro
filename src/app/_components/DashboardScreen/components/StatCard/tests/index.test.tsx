import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Scale } from "lucide-react";
import { StatCard } from "@/app/_components/DashboardScreen/components/StatCard/index.tsx";

const stats = {
  total: 1000,
  current: 400,
  mean: 500,
};

const props = {
  title: "Saldo",
  icon: Scale,
  hint: "Como o saldo sai",
  stats,
};

const UP_GLYPH = /▲/;

describe("StatCard", () => {
  it("heads the card with its own total and two secondary rows", () => {
    const { container } = render(<StatCard {...props} />);

    expect(screen.getByRole("heading", { name: "Saldo" })).toBeInTheDocument();
    // toHaveTextContent, not getByText: the headline is two text nodes now —
    // its cents are their own dimmed span — and getByText reads only an
    // element's DIRECT text children.
    expect(container.querySelector(".total")).toHaveTextContent("R$ 10,00");
    expect(screen.getByText("Realizado")).toBeInTheDocument();
    expect(screen.getByText("Média/mês")).toBeInTheDocument();
    expect(screen.queryByText("Desvio padrão")).not.toBeInTheDocument();
    expect(screen.queryByText("Mediana")).not.toBeInTheDocument();
  });

  it("draws the sign glyph only on a signed card", () => {
    const { rerender } = render(<StatCard {...props} />);

    expect(screen.queryByText("▲")).not.toBeInTheDocument();

    rerender(<StatCard {...props} signed={true} />);

    expect(screen.getByText(UP_GLYPH)).toBeInTheDocument();
  });

  // It had no axis, no scale and no labels, and restated the figures printed
  // directly above it. Asserted absent so it cannot come back by accident.
  // Scoped to the class, not to `svg`: the icon chip is an <svg> too.
  it("draws no decorative sparkline", () => {
    const { container } = render(<StatCard {...props} />);

    expect(container.querySelector('[class*="spark"]')).toBeNull();
    // The only <svg>s left are the two lucide icons — the chip and the hint.
    expect(
      container.querySelectorAll('svg:not([class^="lucide"])'),
    ).toHaveLength(0);
  });

  it("tints the icon chip with the card's own semantic pair", () => {
    const { container, rerender } = render(<StatCard {...props} />);

    expect(container.querySelector(".chipBrand")).not.toBeNull();

    rerender(<StatCard {...props} tone="negative" />);

    // The NEUTRAL pair, not the negative one: a normal expense is not red.
    expect(container.querySelector(".chipNeutral")).not.toBeNull();
  });
});
