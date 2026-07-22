import { describe, expect, it } from "vitest";
import { digitsToCents, formatCents } from "./money.helper";

describe("formatCents", () => {
  it("zero-pads to two decimals", () => {
    expect(formatCents(0)).toBe("0,00");
    expect(formatCents(5)).toBe("0,05");
  });

  it("splits cents from the integer part", () => {
    expect(formatCents(123)).toBe("1,23");
    expect(formatCents(123456)).toBe("1234,56");
  });
});

describe("digitsToCents", () => {
  it("treats empty input as zero", () => {
    expect(digitsToCents("")).toBe(0);
  });

  it("strips the mask and appends the new digit", () => {
    expect(digitsToCents(`1,2${"4"}`)).toBe(124);
  });

  it("strips paste junk, keeping only 0-9", () => {
    expect(digitsToCents("abc50def")).toBe(50);
    expect(digitsToCents("R$ 1.234,56")).toBe(123456);
  });
});
