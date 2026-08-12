import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useBarMark } from "@/app/_components/DashboardScreen/components/MonthlyBarChart/components/BarMark/hook.ts";

const props = {
  x: 1,
  y: 2,
  width: 3,
  height: 4,
  fill: "var(--color-positive)",
  estimated: false,
  title: "Ago/26 · Entradas · R$ 10,00 · lançado",
  plotHeight: 100,
  showTooltip: jest.fn(),
  hideTooltip: jest.fn(),
};

describe("useBarMark", () => {
  it("draws a recorded month at full opacity, geometry untouched", () => {
    const { result } = renderHook(() => useBarMark(props));

    expect(result.current).toMatchObject({
      x: 1,
      y: 2,
      width: 3,
      height: 4,
      plotHeight: 100,
      opacity: 1,
    });
  });

  it("halves the opacity of a projected month", () => {
    const { result } = renderHook(() =>
      useBarMark({ ...props, estimated: true }),
    );

    expect(result.current.opacity).toBe(0.5);
  });

  it("binds its own title to the tooltip", () => {
    const showTooltip = jest.fn();
    const { result } = renderHook(() => useBarMark({ ...props, showTooltip }));

    result.current.show({ clientX: 5, clientY: 6 });

    expect(showTooltip).toHaveBeenCalledWith(
      { clientX: 5, clientY: 6 },
      props.title,
    );
  });
});
