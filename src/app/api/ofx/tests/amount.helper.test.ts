/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { amountToCents, dateToMonth } from "@/app/api/ofx/amount.helper.ts";
import { MAX_CENTS } from "@/lib/money.ts";

describe("amountToCents", () => {
  it("reads a spec-shaped amount", () => {
    expect(amountToCents("1234.56")).toBe(123_456);
    expect(amountToCents("-1234.56")).toBe(-123_456);
    expect(amountToCents("+12.30")).toBe(1230);
  });

  it("reads the last separator as the decimal point", () => {
    expect(amountToCents("1.234,56")).toBe(123_456);
    expect(amountToCents("1,234.56")).toBe(123_456);
  });

  it("reads a bare integer as whole units", () => {
    expect(amountToCents("1234")).toBe(123_400);
  });

  it("truncates a third decimal rather than rounding it", () => {
    expect(amountToCents("1.999")).toBe(199);
  });

  it("pads a single decimal digit", () => {
    expect(amountToCents("1.5")).toBe(150);
  });

  it("ignores whitespace", () => {
    expect(amountToCents(" 12.34 ")).toBe(1234);
  });

  it("returns null for something that is not an amount", () => {
    expect(amountToCents("abc")).toBeNull();
    expect(amountToCents("")).toBeNull();
  });

  it("drops a row above the R$ 1 billion ceiling instead of clamping", () => {
    expect(amountToCents(`${MAX_CENTS}`)).toBeNull();
  });
});

describe("dateToMonth", () => {
  it("takes the YYYYMM prefix of a DTPOSTED", () => {
    expect(dateToMonth("20260812")).toBe(202_608);
    expect(dateToMonth("20260812120000[-3:BRT]")).toBe(202_608);
  });

  it("strips non-digits before reading", () => {
    expect(dateToMonth("2026-08-12")).toBe(202_608);
  });

  it("returns null when there are fewer than six digits", () => {
    expect(dateToMonth("2026")).toBeNull();
  });

  it("returns null for a month outside 01..12", () => {
    expect(dateToMonth("20261312")).toBeNull();
    expect(dateToMonth("20260012")).toBeNull();
  });

  it("returns null for a year outside the accepted span", () => {
    expect(dateToMonth("18991201")).toBeNull();
  });
});
