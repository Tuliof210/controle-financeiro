import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { DotMark } from "@/app/_components/DashboardScreen/components/BalanceLineChart/components/DotMark/index.tsx";

const props = {
  cx: 10,
  cy: 20,
  title: "ignored",
  projected: false,
  simulated: false,
  tip: {
    title: "Ago/26",
    tag: "real",
    plotX: 10,
    rows: [
      {
        key: "cumulative",
        label: "acumulado",
        value: "R$ 10,00",
        tone: "brand" as const,
      },
    ],
  },
  showTooltip: jest.fn(),
  hideTooltip: jest.fn(),
};

// The whole bubble, not a shorter per-mark string: the bubble is aria-hidden, so
// this name is the only route to the figure.
const LABEL = "Ago/26 · real · acumulado R$ 10,00";

const dot = (over: Partial<typeof props> = {}) => {
  render(
    <svg aria-hidden="true">
      <DotMark {...props} {...over} />
    </svg>,
  );
  return screen.getByLabelText(LABEL);
};

describe("DotMark", () => {
  // 24px, not the old 20: WCAG 2.2 SC 2.5.8's floor.
  it("gives the dot a hit target that carries the whole readout", () => {
    expect(dot()).toHaveAttribute("r", "12");
  });

  it("is reachable by keyboard, with a role", () => {
    const hit = dot();

    expect(hit).toHaveAttribute("tabindex", "0");
    expect(hit).toHaveAttribute("role", "button");
  });

  it("opens and closes the tooltip on the hit target", () => {
    const showTooltip = jest.fn();
    const hideTooltip = jest.fn();
    const hit = dot({ showTooltip, hideTooltip });

    fireEvent.pointerEnter(hit);
    fireEvent.pointerLeave(hit);

    expect(showTooltip).toHaveBeenCalled();
    expect(hideTooltip).toHaveBeenCalled();
  });

  // The pointer path was the only one: a keyboard-only reader could not reach any
  // per-month figure, and on touch pointerenter/leave bracket finger-down so the
  // bubble lived only while held.
  it("opens and closes the tooltip on focus and blur", () => {
    const showTooltip = jest.fn();
    const hideTooltip = jest.fn();
    const hit = dot({ showTooltip, hideTooltip });

    fireEvent.focus(hit);
    expect(showTooltip).toHaveBeenCalled();

    fireEvent.blur(hit);
    expect(hideTooltip).toHaveBeenCalled();
  });
});
