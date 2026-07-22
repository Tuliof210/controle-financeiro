import { describe, expect, it } from "vitest";
import { formatYyyymm } from "./range.helper";

describe("formatYyyymm", () => {
  it("formats a YYYYMM integer as Mon/YY", () => {
    expect(formatYyyymm(202501)).toBe("Jan/25");
    expect(formatYyyymm(202808)).toBe("Ago/28");
  });

  it("returns a muted placeholder for null", () => {
    expect(formatYyyymm(null)).toBe("—");
  });
});
