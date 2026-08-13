import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useChartTooltip } from "@/app/_components/DashboardScreen/components/ChartTooltip/hook.ts";

const content = {
  title: "Ago/26",
  tag: "real",
  rows: [
    {
      key: "cumulative",
      label: "acumulado",
      value: "R$ 10,00",
      tone: "brand" as const,
    },
  ],
};

describe("useChartTooltip", () => {
  it("starts with no bubble", () => {
    const { result } = renderHook(() => useChartTooltip());

    expect(result.current.tooltip).toBeNull();
  });

  it("places the bubble at the pointer, carrying the mark's own content", () => {
    const { result } = renderHook(() => useChartTooltip());

    act(() => {
      result.current.showTooltip({ clientX: 10, clientY: 20 }, content);
    });

    expect(result.current.tooltip).toEqual({ x: 10, y: 20, ...content });
  });

  it("carries the mark's plot x, so a chart can share the same hover", () => {
    const { result } = renderHook(() => useChartTooltip());

    act(() => {
      result.current.showTooltip(
        { clientX: 1, clientY: 2 },
        { ...content, plotX: 42 },
      );
    });

    expect(result.current.tooltip?.plotX).toBe(42);
  });

  it("drops it again on leave", () => {
    const { result } = renderHook(() => useChartTooltip());
    act(() => {
      result.current.showTooltip({ clientX: 1, clientY: 2 }, content);
    });

    act(() => {
      result.current.hideTooltip();
    });

    expect(result.current.tooltip).toBeNull();
  });
});
