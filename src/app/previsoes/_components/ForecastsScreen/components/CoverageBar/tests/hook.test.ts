import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useCoverageBar } from "@/app/previsoes/_components/ForecastsScreen/components/CoverageBar/hook.ts";

const period = { start: 202_601, end: 202_604 };

describe("useCoverageBar", () => {
  it("positions the forecast's months inside the global range", () => {
    const { result } = renderHook(() =>
      useCoverageBar({ months: [202_601, 202_602], period }),
    );

    expect(result.current.segments).toEqual([{ left: "0%", width: "50%" }]);
  });

  it("leaves the track empty when the forecast covers none of it", () => {
    const { result } = renderHook(() =>
      useCoverageBar({ months: [202_712], period }),
    );

    expect(result.current.segments).toEqual([]);
  });
});
