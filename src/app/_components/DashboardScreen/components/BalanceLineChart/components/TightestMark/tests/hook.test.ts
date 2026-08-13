import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useTightestMark } from "@/app/_components/DashboardScreen/components/BalanceLineChart/components/TightestMark/hook.ts";

describe("useTightestMark", () => {
  it("hangs the tag two tag-heights clear of the point", () => {
    const { result } = renderHook(() =>
      useTightestMark({ x: 10, y: 100, height: 200, flip: false }),
    );

    expect(result.current.tagY).toBe(60);
  });

  it("floors the tag at the plot's top edge", () => {
    const { result } = renderHook(() =>
      useTightestMark({ x: 10, y: 5, height: 200, flip: true }),
    );

    expect(result.current.tagY).toBe(0);
    expect(result.current.flip).toBe(true);
  });
});
