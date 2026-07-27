import { Scale } from "lucide-react";
import { describe, expect, it } from "vitest";
import type { Stats } from "@/app/api/dashboard/types";
import { useStatCard } from "./hook";

// useStatCard calls no React hooks, so it runs under the repo's node-environment
// Vitest config with no jsdom and no @testing-library/react — the same reason
// the rest of this folder has no tests does not apply to it.
const stats = (total: number): Stats => ({
  total,
  current: 50000,
  mean: 25000,
  stdDev: 1000,
  median: 20000,
});

const base = { title: "Saldo", icon: Scale, hint: "…", series: [1, 2, 3] };

describe("useStatCard", () => {
  it("marks a negative signed total with ▼ and the negative accent", () => {
    const card = useStatCard({ ...base, stats: stats(-7700000), signed: true });
    expect(card.glyph).toBe("▼");
    expect(card.tone).toBe("negative");
    expect(card.total).toBe("−R$ 77.000,00");
  });

  it("marks a positive signed total with ▲ and the positive accent", () => {
    const card = useStatCard({ ...base, stats: stats(10050000), signed: true });
    expect(card.glyph).toBe("▲");
    expect(card.tone).toBe("positive");
    expect(card.total).toBe("R$ 100.500,00");
  });

  it("treats a zero signed total as positive rather than negative", () => {
    const card = useStatCard({ ...base, stats: stats(0), signed: true });
    expect(card.glyph).toBe("▲");
    expect(card.tone).toBe("positive");
  });

  it("passes the fixed tone through untouched and adds no glyph when unsigned", () => {
    const card = useStatCard({
      ...base,
      title: "Entradas",
      stats: stats(14600000),
      tone: "positive",
    });
    expect(card.glyph).toBeNull();
    expect(card.tone).toBe("positive");
  });

  it("leaves tone undefined when a card is neither signed nor toned", () => {
    expect(useStatCard({ ...base, stats: stats(1) }).tone).toBeUndefined();
  });

  it("formats the four secondary rows in order", () => {
    const card = useStatCard({ ...base, stats: stats(1), signed: true });
    expect(card.rows).toEqual([
      { key: "current", label: "Realizado", value: "R$ 500,00" },
      { key: "mean", label: "Média/mês", value: "R$ 250,00" },
      { key: "median", label: "Mediana", value: "R$ 200,00" },
      { key: "stdDev", label: "Desvio padrão", value: "R$ 10,00" },
    ]);
  });

  it("colours the sparkline from the FIXED tone, not the sign of the total", () => {
    const income = useStatCard({ ...base, stats: stats(1), tone: "positive" });
    expect(income.color).toBe("var(--color-positive)");
    // Saldo passes no tone, so its line stays brand-coloured whichever way the
    // balance goes — a green line under a red headline would read as a second,
    // contradicting signal.
    const down = useStatCard({ ...base, stats: stats(-1), signed: true });
    expect(down.tone).toBe("negative");
    expect(down.color).toBe("var(--color-brand)");
  });

  it("hands the card its own series, and null for an empty one", () => {
    expect(useStatCard({ ...base, stats: stats(1) }).spark).not.toBeNull();
    expect(
      useStatCard({ ...base, stats: stats(1), series: [] }).spark,
    ).toBeNull();
  });
});
