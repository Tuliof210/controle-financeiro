import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { Wallet } from "lucide-react";
import { useStatCard } from "@/app/_components/DashboardScreen/components/StatCard/hook.ts";

const stats = {
  total: 1000,
  current: 400,
  mean: 500,
};

const base = {
  title: "Saldo",
  icon: Wallet,
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

  // The chip names the CARD, so it must not flip green/red with the sign of a
  // total the reader is still looking at.
  it("keeps the chip on the fixed tone even when the sign flips", () => {
    const { result } = renderHook(() =>
      useStatCard({ ...base, signed: true, stats: { ...stats, total: -1 } }),
    );

    expect(result.current.chip).toBe("brand");
  });

  // Two rows, not four: mediana and desvio padrão came off the card with the
  // sparkline (owner's decision, 2026-08-13), and nothing else read them.
  it("formats the headline and the two secondary rows", () => {
    const { result } = renderHook(() => useStatCard(base));

    expect(result.current.total).toBe(1000);
    expect(result.current.rows.map((row) => row.label)).toEqual([
      "Realizado",
      "Média/mês",
    ]);
    expect(result.current.rows[0].value).toBe("R$ 4,00");
  });
});
