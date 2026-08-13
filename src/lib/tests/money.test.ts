/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  digitsToCents,
  formatCents,
  formatMoney,
  formatMoneyShort,
  formatMoneyShortK,
  MAX_CENTS,
  splitMoney,
} from "@/lib/money.ts";

const ZERO = 0;
const ONE_CENT = 1;
const REAIS_1234_56 = 123_456;
const NEGATIVE_640 = -64_000;
const K_12_345 = 1_234_500;
const K_20 = 2_000_000;
const K_NEGATIVE_2_8 = -280_000;

describe("formatCents", () => {
  it("pads below one real so the comma always has two digits", () => {
    expect(formatCents(ZERO)).toBe("0,00");
    expect(formatCents(ONE_CENT)).toBe("0,01");
  });

  it("leaves the value ungrouped and unsigned", () => {
    expect(formatCents(REAIS_1234_56)).toBe("1234,56");
    expect(formatCents(NEGATIVE_640)).toBe("640,00");
  });
});

describe("formatMoney", () => {
  it("groups thousands and prefixes the currency", () => {
    expect(formatMoney(REAIS_1234_56)).toBe("R$ 1.234,56");
  });

  it("uses U+2212 for a negative value", () => {
    expect(formatMoney(NEGATIVE_640)).toBe("−R$ 640,00");
  });
});

describe("splitMoney", () => {
  it("cuts the same string formatMoney produces, comma on the head", () => {
    expect(splitMoney(REAIS_1234_56)).toEqual({
      head: "R$ 1.234,",
      fraction: "56",
    });
    // The two halves rejoin into exactly what formatMoney says — the variant
    // must never be able to disagree with the formatter it splits.
    const { head, fraction } = splitMoney(REAIS_1234_56);
    expect(head + fraction).toBe(formatMoney(REAIS_1234_56));
  });

  it("carries the U+2212 sign into the head", () => {
    expect(splitMoney(NEGATIVE_640).head).toBe("−R$ 640,");
  });

  it("keeps the padded fraction below one real", () => {
    expect(splitMoney(ONE_CENT)).toEqual({ head: "R$ 0,", fraction: "01" });
  });
});

describe("formatMoneyShort", () => {
  it("drops the cents without rounding up", () => {
    expect(formatMoneyShort(REAIS_1234_56)).toBe("R$ 1.234");
    expect(formatMoneyShort(NEGATIVE_640)).toBe("−R$ 640");
  });
});

describe("formatMoneyShortK", () => {
  it("truncates to one decimal of thousands", () => {
    expect(formatMoneyShortK(K_12_345)).toBe("R$ 12,3K");
  });

  it("drops the decimal when it is zero", () => {
    expect(formatMoneyShortK(K_20)).toBe("R$ 20K");
  });

  it("keeps the sign", () => {
    expect(formatMoneyShortK(K_NEGATIVE_2_8)).toBe("−R$ 2,8K");
  });
});

describe("digitsToCents", () => {
  it("keeps only digits", () => {
    expect(digitsToCents("1.234,56")).toBe(REAIS_1234_56);
    expect(digitsToCents("R$ abc")).toBe(ZERO);
  });

  it("clamps at MAX_CENTS", () => {
    expect(digitsToCents("999999999999999")).toBe(MAX_CENTS);
  });
});
