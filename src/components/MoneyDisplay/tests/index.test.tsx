import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MoneyDisplay } from "@/components/MoneyDisplay/index.tsx";

describe("MoneyDisplay", () => {
  it("still reads as one uninterrupted figure", () => {
    render(<MoneyDisplay value={123_456} />);

    expect(screen.getByLabelText("R$ 1.234,56")).toBeInTheDocument();
  });

  it("dims hero cents with the money token", () => {
    const { container } = render(
      <MoneyDisplay value={123_456} variant="hero" />,
    );
    const fraction = container.querySelector(".fraction");

    expect(fraction).toHaveTextContent("56");
    expect(fraction).toHaveClass("fraction");
  });

  it("does not dim base cents", () => {
    const { container } = render(<MoneyDisplay value={123_456} />);

    expect(container.querySelector(".fraction")).toBeNull();
  });

  it("does not colour an expense by default", () => {
    const { container } = render(<MoneyDisplay value={-64_000} />);

    expect(container.firstChild).not.toHaveClass("negative");
    expect(screen.getByLabelText("−R$ 640,00")).toBeInTheDocument();
  });
});
