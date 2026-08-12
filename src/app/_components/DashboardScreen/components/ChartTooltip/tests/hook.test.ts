import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useChartTooltip } from "@/app/_components/DashboardScreen/components/ChartTooltip/hook.ts";

describe("useChartTooltip", () => {
  it("starts with no bubble", () => {
    const { result } = renderHook(() => useChartTooltip());

    expect(result.current.tooltip).toBeNull();
  });

  it("places the bubble at the pointer, carrying the mark's own text", () => {
    const { result } = renderHook(() => useChartTooltip());

    act(() => {
      result.current.showTooltip({ clientX: 10, clientY: 20 }, "Ago/26");
    });

    expect(result.current.tooltip).toEqual({ x: 10, y: 20, text: "Ago/26" });
  });

  it("drops it again on leave", () => {
    const { result } = renderHook(() => useChartTooltip());
    act(() => {
      result.current.showTooltip({ clientX: 1, clientY: 2 }, "x");
    });

    act(() => {
      result.current.hideTooltip();
    });

    expect(result.current.tooltip).toBeNull();
  });
});
