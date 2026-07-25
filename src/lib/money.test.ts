import { describe, expect, it } from "vitest";
import {
  digitsToCents,
  formatCents,
  formatMoney,
  formatMoneyShort,
} from "./money";

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

describe("formatMoney", () => {
  it("prefixes the currency and keeps two decimals", () => {
    expect(formatMoney(0)).toBe("R$ 0,00");
    expect(formatMoney(64000)).toBe("R$ 640,00");
  });

  it("groups thousands with a dot", () => {
    expect(formatMoney(123456)).toBe("R$ 1.234,56");
    expect(formatMoney(123456789)).toBe("R$ 1.234.567,89");
  });

  it("renders negatives with a minus sign, digits unaffected", () => {
    expect(formatMoney(-64000)).toBe("−R$ 640,00");
    expect(formatMoney(-123456)).toBe("−R$ 1.234,56");
  });
});

describe("formatMoneyShort", () => {
  it("drops the cents without rounding up", () => {
    expect(formatMoneyShort(123499)).toBe("R$ 1.234");
    expect(formatMoneyShort(99)).toBe("R$ 0");
  });

  it("keeps the sign and the grouping", () => {
    expect(formatMoneyShort(-123456789)).toBe("−R$ 1.234.567");
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
