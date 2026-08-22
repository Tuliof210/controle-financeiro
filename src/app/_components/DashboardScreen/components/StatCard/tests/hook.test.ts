import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useStatCard } from "@/app/_components/DashboardScreen/components/StatCard/hook.ts";

const stats = {
  total: 1000,
  current: 400,
  mean: 500,
  stdDev: 100,
  median: 450,
};

const base = {
  title: "Saldo",
  icon: "wallet" as const,
  hint: "x",
  stats,
  series: [1, 2, 3],
};

describe("useStatCard", () => {
  it("draws no sign glyph on an always-positive card", () => {
    const { result } = renderHook(() =>
      useStatCard({ ...base, tone: "positive" }),
    );

    expect(result.current.glyph).toBeNull();
    expect(result.current.tone).toBe("positive");
    expect(result.current.chip).toBe("positive");
  });

  it("points the glyph up on a signed card in the black", () => {
    const { result } = renderHook(() => useStatCard({ ...base, signed: true }));

    expect(result.current.glyph).toBe("▲");
    expect(result.current.tone).toBe("positive");
  });

  it("points it down once the total is negative", () => {
    const { result } = renderHook(() =>
      useStatCard({ ...base, signed: true, stats: { ...stats, total: -1 } }),
    );

    expect(result.current.glyph).toBe("▼");
    expect(result.current.tone).toBe("negative");
  });

  it("keeps the chip and the sparkline on the fixed tone", () => {
    const { result } = renderHook(() =>
      useStatCard({ ...base, signed: true, stats: { ...stats, total: -1 } }),
    );

    expect(result.current.chip).toBe("brand");
    expect(result.current.color).toBe("var(--color-brand)");
  });

  it("formats the headline and the four secondary rows", () => {
    const { result } = renderHook(() => useStatCard(base));

    expect(result.current.total).toBe(1000);
    expect(result.current.rows.map((row) => row.label)).toEqual([
      "Realizado",
      "Média/mês",
      "Mediana",
      "Desvio padrão",
    ]);
    expect(result.current.rows[0].value).toBe("R$ 4,00");
  });

  it("draws no sparkline for an empty series", () => {
    const { result } = renderHook(() => useStatCard({ ...base, series: [] }));

    expect(result.current.spark).toBeNull();
  });
});
