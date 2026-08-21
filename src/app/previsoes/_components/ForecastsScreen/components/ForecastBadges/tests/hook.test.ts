import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useForecastBadges } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastBadges/hook.ts";

describe("useForecastBadges", () => {
  it("labels a fixed forecast and tints it as fixed", () => {
    const { result } = renderHook(() =>
      useForecastBadges({ kind: "fixed", simulated: false }),
    );

    expect(result.current.items).toEqual([
      expect.objectContaining({ key: "fixed", label: "Fixa" }),
    ]);
    expect(result.current.items[0].className).toContain("fixed");
  });

  it("labels a commitment and tints it as commitment", () => {
    const { result } = renderHook(() =>
      useForecastBadges({ kind: "commitment", simulated: false }),
    );

    expect(result.current.items[0]).toMatchObject({
      key: "commitment",
      label: "Compromisso futuro",
    });
    expect(result.current.items[0].className).toContain("commitment");
    expect(result.current.items[0].className).not.toContain("fixed");
  });

  it("appends the simulated flag after the kind", () => {
    const { result } = renderHook(() =>
      useForecastBadges({ kind: "fixed", simulated: true }),
    );

    expect(result.current.items.map((item) => item.label)).toEqual([
      "Fixa",
      "Simulado",
    ]);
    expect(result.current.items[1].className).toContain("simulated");
  });
});
