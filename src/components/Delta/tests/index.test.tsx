import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { Delta } from "@/components/Delta/index.tsx";

describe("Delta", () => {
  it("renders a percent with a direction arrow", () => {
    const { container } = render(<Delta value={12} />);

    expect(screen.getByRole("status")).toHaveTextContent("+12%");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("formats a money delta through MoneyDisplay", () => {
    render(<Delta value={-64_000} money={true} />);

    expect(screen.getByRole("status")).toHaveTextContent("−R$ 640,00");
  });

  it("hides the arrow when asked", () => {
    const { container } = render(<Delta value={4} showArrow={false} />);

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
