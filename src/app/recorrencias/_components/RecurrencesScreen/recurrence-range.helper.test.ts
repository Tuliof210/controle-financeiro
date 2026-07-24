import { describe, expect, it } from "vitest";
import { formatMonths } from "./recurrence-range.helper";

describe("formatMonths", () => {
  it("renders a contiguous run as a single interval", () => {
    expect(formatMonths([202608, 202609, 202610, 202611, 202612])).toBe(
      "Ago/26–Dez/26",
    );
  });

  it("renders a single month without a dash", () => {
    expect(formatMonths([202605])).toBe("Mai/26");
  });

  it("joins non-contiguous intervals with a middot", () => {
    expect(formatMonths([202601, 202602, 202603, 202607, 202608, 202609])).toBe(
      "Jan/26–Mar/26 · Jul/26–Set/26",
    );
  });
});
