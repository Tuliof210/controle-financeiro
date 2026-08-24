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
      "afford",
      "ceiling",
      "goals",
    ]);
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
