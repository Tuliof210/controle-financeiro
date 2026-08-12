import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ChartTooltip } from "@/app/_components/DashboardScreen/components/ChartTooltip/index.tsx";

describe("ChartTooltip", () => {
  it("renders nothing while no mark is hovered", () => {
    const { container } = render(<ChartTooltip tooltip={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("bubbles the mark's own text at the pointer", () => {
    render(<ChartTooltip tooltip={{ x: 10, y: 20, text: "Ago/26" }} />);

    expect(screen.getByRole("tooltip")).toHaveTextContent("Ago/26");
  });
});
