import "@testing-library/jest-dom/jest-globals";
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { DotMark } from "@/app/_components/DashboardScreen/components/BalanceLineChart/components/DotMark/index.tsx";

const props = {
  cx: 10,
  cy: 20,
  title: "Ago/26 · acumulado R$ 10,00",
  projected: false,
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

describe("DotMark", () => {
  it("gives the dot a hit target that carries its accessible name", () => {
    render(
      <svg aria-hidden="true">
        <DotMark {...props} />
      </svg>,
    );

    expect(screen.getByLabelText(props.title)).toHaveAttribute("r", "10");
  });

  it("opens and closes the tooltip on the hit target", () => {
    const showTooltip = jest.fn();
    const hideTooltip = jest.fn();
    render(
      <svg aria-hidden="true">
        <DotMark
          {...props}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        />
      </svg>,
    );
    const hit = screen.getByLabelText(props.title);

    fireEvent.pointerEnter(hit);
    fireEvent.pointerLeave(hit);

    expect(showTooltip).toHaveBeenCalled();
    expect(hideTooltip).toHaveBeenCalled();
  });
});
