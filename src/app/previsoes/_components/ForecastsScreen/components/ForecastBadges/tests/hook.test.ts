import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useForecastBadges } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastBadges/hook.ts";

describe("useForecastBadges", () => {
  it("labels a fixed forecast", () => {
    const { result } = renderHook(() =>
      useForecastBadges({ kind: "fixed", simulated: false }),
    );

    expect(result.current).toEqual({
      kindLabel: "Fixa",
      simulated: false,
    });
  });

  it("labels a commitment", () => {
    const { result } = renderHook(() =>
      useForecastBadges({ kind: "commitment", simulated: false }),
    );

    expect(result.current.kindLabel).toBe("Compromisso futuro");
  });

  it("keeps simulated orthogonal to kind", () => {
    const { result } = renderHook(() =>
      useForecastBadges({ kind: "fixed", simulated: true }),
    );

    expect(result.current).toEqual({
      kindLabel: "Fixa",
      simulated: true,
    });
  });
});
