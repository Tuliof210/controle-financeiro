import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { TightestMark } from "@/app/_components/DashboardScreen/components/BalanceLineChart/components/TightestMark/index.tsx";

describe("TightestMark", () => {
  it("drops a dashed rule from the point to the axis, under its tag", () => {
    const { container } = render(
      <svg aria-hidden="true">
        <TightestMark x={50} y={30} height={200} flip={false} />
      </svg>,
    );

    expect(screen.getByText("MÊS MAIS APERTADO")).toBeInTheDocument();
    expect(container.querySelector("line")).toHaveAttribute("y2", "200");
  });
});
