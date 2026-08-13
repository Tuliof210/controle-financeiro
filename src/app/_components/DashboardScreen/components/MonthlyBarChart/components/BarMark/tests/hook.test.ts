import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useBarMark } from "@/app/_components/DashboardScreen/components/MonthlyBarChart/components/BarMark/hook.ts";

const tip = {
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
};

const props = {
  x: 1,
  y: 2,
  width: 3,
  height: 4,
  fill: "var(--color-positive)",
  estimated: false,
  title: "Ago/26 · Entradas · R$ 10,00 · lançado",
  tip,
  plotHeight: 100,
  showTooltip: jest.fn(),
  hideTooltip: jest.fn(),
};

describe("useBarMark", () => {
  it("fills a recorded month solid and hides its stroke, geometry untouched", () => {
    const { result } = renderHook(() => useBarMark(props));

    expect(result.current).toMatchObject({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
      plotHeight: 100,
    });
    expect(result.current.shape).toMatchObject({
      fillOpacity: 1,
      strokeOpacity: 0,
    });
  });

  it("draws a projected month as a dashed outline, not just a paler fill", () => {
    const { result } = renderHook(() =>
      useBarMark({ ...props, estimated: true }),
    );

    // The dash is the channel that survives greyscale; the wash is only
    // reinforcement, which is why the stroke — not the fill — is what turns on.
    expect(result.current.shape).toMatchObject({
      strokeOpacity: 1,
      strokeDasharray: "3 3",
      fillOpacity: "var(--opacity-data-wash)",
    });
  });

  it("binds its month's own content to the tooltip", () => {
    const showTooltip = jest.fn();
    const { result } = renderHook(() => useBarMark({ ...props, showTooltip }));

    result.current.show({ clientX: 5, clientY: 6 });

    expect(showTooltip).toHaveBeenCalledWith({ clientX: 5, clientY: 6 }, tip);
  });
});
