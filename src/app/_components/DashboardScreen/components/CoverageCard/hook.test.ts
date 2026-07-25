import { describe, expect, it } from "vitest";
import type { CoverageMonth } from "@/app/api/dashboard/types";
import { useCoverageCard } from "./hook";

const month = (
  m: number,
  committed: number,
  recorded: number,
): CoverageMonth => ({
  month: m,
  committed,
  recorded,
  gap: committed - recorded,
});
const card = (
  percent: number | null,
  months: CoverageMonth[] = [],
  totals = { committed: 0, recorded: 0 },
) => useCoverageCard({ coverage: { ...totals, percent, months } });

describe("useCoverageCard", () => {
  it("measures the bar by the SHORTFALL, matching the tone and the sort", () => {
    // Nothing recorded is the worst month, so its bar must be full — a bar
    // measuring `recorded` would leave the worst month empty and the best full.
    const worst = card(50, [month(202603, 1000, 0)]).rows[0];
    const best = card(50, [month(202601, 1000, 750)]).rows[0];
    expect(worst.percent).toBe(100);
    expect(best.percent).toBe(25);
    expect(worst.percent).toBeGreaterThan(best.percent);
  });

  it("goes empty when nothing was committed in any elapsed month", () => {
    expect(card(null).empty).toBe(true);
  });

  it("is not empty at 0%, which means committed but nothing recorded", () => {
    expect(card(0, [month(202603, 1000, 0)]).empty).toBe(false);
  });

  it("states the totals in words above the list", () => {
    const { headline, summary } = card(14, [], {
      committed: 7350000,
      recorded: 1050000,
    });
    expect(headline).toBe("14%");
    expect(summary).toBe("R$ 10.500,00 lançados de R$ 73.500,00 previstos");
  });

  it("names the row for screen readers, since the bar is a colour", () => {
    expect(card(50, [month(202603, 1050000, 0)]).rows[0].srLabel).toBe(
      "Mar/26: faltam R$ 10.500,00 de R$ 10.500,00 previstos",
    );
  });
});
