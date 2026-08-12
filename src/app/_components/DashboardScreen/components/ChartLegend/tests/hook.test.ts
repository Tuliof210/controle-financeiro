import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useChartLegend } from "@/app/_components/DashboardScreen/components/ChartLegend/hook.ts";

describe("useChartLegend", () => {
  it("offers the swatches a fill-coded chart needs", () => {
    const items = [{ key: "income", label: "Entradas", color: "green" }];
    const { result } = renderHook(() => useChartLegend({ items }));

    expect(result.current).toEqual({ items, note: undefined });
  });

  it("falls back to no swatch for a stroke-coded chart", () => {
    const { result } = renderHook(() =>
      useChartLegend({ note: "Tracejado é projeção" }),
    );

    expect(result.current.items).toEqual([]);
    expect(result.current.note).toBe("Tracejado é projeção");
  });
});
