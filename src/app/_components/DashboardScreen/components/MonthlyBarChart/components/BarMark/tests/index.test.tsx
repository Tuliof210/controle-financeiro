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
  simulated: false,
  tip: {
    title: "Ago/26",
    tag: "real",
    rows: [
      {
        key: "income",
        label: "entradas",
        value: "R$ 10,00",
        tone: "positive" as const,
      },
    ],
  },
  plotHeight: 200,
  showTooltip: jest.fn(),
  hideTooltip: jest.fn(),
};

// The whole bubble, not one series' figure: the bubble is aria-hidden, so this
// name is the only route to entradas and saídas per month.
const LABEL = "Ago/26 · real · entradas R$ 10,00";

const bar = (over: Partial<typeof props> = {}) => {
  render(
    <svg aria-hidden="true">
      <BarMark {...props} {...over} />
    </svg>,
  );
  return screen.getByLabelText(LABEL);
};

describe("BarMark", () => {
  it("makes the whole column the hit target, not the bar", () => {
    expect(bar()).toHaveAttribute("height", "200");
  });

  it("is reachable by keyboard, with a role", () => {
    const hit = bar();

    expect(hit).toHaveAttribute("tabindex", "0");
    expect(hit).toHaveAttribute("role", "button");
  });

  it("opens the tooltip on the column", () => {
    const showTooltip = jest.fn();

    fireEvent.pointerMove(bar({ showTooltip }));

    expect(showTooltip).toHaveBeenCalled();
  });

  // The pointer path was the only one: entradas and saídas per month exist
  // nowhere else on this screen, so a keyboard-only reader could not reach them.
  it("opens and closes the tooltip on focus and blur", () => {
    const showTooltip = jest.fn();
    const hideTooltip = jest.fn();
    const hit = bar({ showTooltip, hideTooltip });

    fireEvent.focus(hit);
    expect(showTooltip).toHaveBeenCalled();

    fireEvent.blur(hit);
    expect(hideTooltip).toHaveBeenCalled();
  });
});
