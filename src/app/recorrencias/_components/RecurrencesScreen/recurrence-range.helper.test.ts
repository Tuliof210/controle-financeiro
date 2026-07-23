import { describe, expect, it } from "vitest";
import { formatPeriod, formatYyyymm } from "./recurrence-range.helper";

describe("formatYyyymm", () => {
  it("formats a YYYYMM integer as Mon/YY", () => {
    expect(formatYyyymm(202501)).toBe("Jan/25");
    expect(formatYyyymm(202608)).toBe("Ago/26");
  });
});

describe("formatPeriod", () => {
  it("joins the start and end labels with an arrow", () => {
    expect(formatPeriod(202608, 202612)).toBe("Ago/26 → Dez/26");
  });
});
