import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import {
  TAG_CHAR_PX,
  TAG_PAD_X,
} from "@/app/_components/DashboardScreen/chart-marks.config.ts";
import { ChartTag } from "@/app/_components/DashboardScreen/components/ChartTag/index.tsx";

const inSvg = (element: React.ReactElement) =>
  render(<svg aria-hidden="true">{element}</svg>);

describe("ChartTag", () => {
  it("draws the label over its own filled box", () => {
    const { container } = inSvg(
      <ChartTag x={10} y={20} label="PROJETADO" tone="muted" plotWidth={800} />,
    );

    expect(screen.getByText("PROJETADO")).toBeInTheDocument();
    expect(container.querySelector("rect")).toHaveAttribute("x", "10");
  });

  it("hangs the box the other way when it would not fit right of x", () => {
    const { container } = inSvg(
      <ChartTag x={200} y={0} label="ABC" tone="caution" plotWidth={210} />,
    );

    // Derived, not a literal: the box width follows the measured advance of the
    // mono face, so a re-measurement must not read as a broken flip.
    const width = "ABC".length * TAG_CHAR_PX + TAG_PAD_X * 2;

    expect(container.querySelector("rect")).toHaveAttribute(
      "x",
      String(200 - width),
    );
  });
});
