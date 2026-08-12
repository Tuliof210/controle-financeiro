import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ChartTag } from "@/app/_components/DashboardScreen/components/ChartTag/index.tsx";

const inSvg = (element: React.ReactElement) =>
  render(<svg aria-hidden="true">{element}</svg>);

describe("ChartTag", () => {
  it("draws the label over its own filled box", () => {
    const { container } = inSvg(
      <ChartTag x={10} y={20} label="PROJETADO" tone="muted" />,
    );

    expect(screen.getByText("PROJETADO")).toBeInTheDocument();
    expect(container.querySelector("rect")).toHaveAttribute("x", "10");
  });

  it("hangs the box the other way when flipped", () => {
    const { container } = inSvg(
      <ChartTag x={200} y={0} label="ABC" tone="caution" flip={true} />,
    );

    expect(container.querySelector("rect")).toHaveAttribute("x", "166");
  });
});
