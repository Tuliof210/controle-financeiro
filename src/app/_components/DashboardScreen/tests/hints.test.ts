import { describe, expect, it } from "@jest/globals";
import { HINTS } from "@/app/_components/DashboardScreen/hints.ts";

describe("HINTS", () => {
  it("carries one hint per dashboard card", () => {
    expect(Object.keys(HINTS)).toEqual([
      "income",
      "expense",
      "balance",
      "bars",
      "cumulative",
      "ceiling",
      "ceilingCap",
      "goals",
    ]);
  });

  // The ceiling hint was 687 characters — the screen's hardest concept handed to
  // a hover bubble. It is split three ways now, so the cap keeps only what it
  // causes and no bubble on this screen gets that long again.
  it("keeps every hint short enough for a tooltip", () => {
    for (const hint of Object.values(HINTS)) {
      expect(hint.length).toBeLessThan(300);
    }
  });

  it("puts the cap trade-off on the cap, not on the card", () => {
    expect(HINTS.ceilingCap).toContain("acumulado");
    expect(HINTS.ceiling).not.toContain("porcentagem");
  });

  it("restates the reconciliation rule on both money cards", () => {
    expect(HINTS.income).toContain("maior valor");
    expect(HINTS.expense).toContain("maior valor");
  });

  it("is written in pt-BR, like the rest of the UI copy", () => {
    for (const hint of Object.values(HINTS)) {
      expect(hint.length).toBeGreaterThan(0);
    }
    expect(HINTS.ceiling).toContain("teto");
  });
});
