import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useDotMark } from "@/app/_components/DashboardScreen/components/BalanceLineChart/components/DotMark/hook.ts";

const props = {
  cx: 10,
  cy: 20,
  title: "Ago/26 · acumulado R$ 10,00",
  projected: false,
  showTooltip: jest.fn(),
  hideTooltip: jest.fn(),
};

describe("useDotMark", () => {
  it("draws a recorded point at full opacity", () => {
    const { result } = renderHook(() => useDotMark(props));

    expect(result.current.opacity).toBe(1);
  });

  it("halves the opacity of a projected point", () => {
    const { result } = renderHook(() =>
      useDotMark({ ...props, projected: true }),
    );

    expect(result.current.opacity).toBe(0.5);
  });

  it("binds its own title to the tooltip", () => {
    const showTooltip = jest.fn();
    const { result } = renderHook(() => useDotMark({ ...props, showTooltip }));
    const event = { clientX: 1, clientY: 2 };

    result.current.show(event);

    expect(showTooltip).toHaveBeenCalledWith(event, props.title);
  });
});
