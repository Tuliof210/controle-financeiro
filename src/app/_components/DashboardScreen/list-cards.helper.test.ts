import { describe, expect, it } from "vitest";
import { goalLabel, limitTone, sharePercent } from "./list-cards.helper";

describe("sharePercent", () => {
  it("scales a row against the largest row", () => {
    expect(sharePercent(500, 1000)).toBe(50);
    expect(sharePercent(1000, 1000)).toBe(100);
  });

  it("returns 0 rather than NaN when every row is zero", () => {
    // An all-underwater range leaves no slack, so max is 0.
    expect(sharePercent(0, 0)).toBe(0);
    expect(Number.isNaN(sharePercent(0, 0))).toBe(false);
  });

  it("returns 0 for a negative max instead of a negative width", () => {
    expect(sharePercent(100, -50)).toBe(0);
  });
});

describe("limitTone", () => {
  it("is positive at or under the ceiling, including exactly 100", () => {
    expect(limitTone(0)).toBe("positive");
    expect(limitTone(99)).toBe("positive");
    // The boundary the card's whole polarity turns on.
    expect(limitTone(100)).toBe("positive");
  });

  it("is negative past the ceiling", () => {
    expect(limitTone(101)).toBe("negative");
    expect(limitTone(240)).toBe("negative");
  });

  it("treats an unset ceiling as not-overspent", () => {
    expect(limitTone(null)).toBe("positive");
  });
});

describe("goalLabel", () => {
  it("reports the wait in months", () => {
    expect(goalLabel(7)).toBe("~7 meses");
    expect(goalLabel(42)).toBe("~42 meses");
  });

  it("singularises one month", () => {
    expect(goalLabel(1)).toBe("~1 mês");
  });

  it("says unreachable when the pace is zero", () => {
    expect(goalLabel(null)).toBe("inalcançável no ritmo atual");
  });
});
