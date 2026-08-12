import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { BarMark } from "@/app/_components/DashboardScreen/components/MonthlyBarChart/components/BarMark/index.tsx";

const props = {
  x: 10,
  y: 20,
  width: 8,
  height: 40,
  fill: "var(--color-positive)",
  estimated: false,
  title: "Ago/26 · Entradas · R$ 10,00 · lançado",
  plotHeight: 200,
  showTooltip: jest.fn(),
  hideTooltip: jest.fn(),
};

describe("BarMark", () => {
  it("makes the whole column the hit target, not the bar", () => {
    render(
      <svg aria-hidden="true">
        <BarMark {...props} />
      </svg>,
    );

    expect(screen.getByLabelText(props.title)).toHaveAttribute("height", "200");
  });

  it("opens the tooltip on the column", () => {
    const showTooltip = jest.fn();
    render(
      <svg aria-hidden="true">
        <BarMark {...props} showTooltip={showTooltip} />
      </svg>,
    );

    fireEvent.pointerMove(screen.getByLabelText(props.title));

    expect(showTooltip).toHaveBeenCalled();
  });
});
