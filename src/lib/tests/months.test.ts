/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  addMonths,
  buildMonths,
  composeYyyymm,
  currentYyyymm,
  formatYyyymm,
  MONTH_LABELS,
  splitYyyymm,
  yearOptions,
} from "@/lib/months.ts";

describe("splitYyyymm / composeYyyymm", () => {
  it("round-trips a packed month", () => {
    expect(splitYyyymm(202_608)).toEqual({ year: 2026, month: 8 });
    expect(composeYyyymm(2026, 8)).toBe(202_608);
  });
});

describe("currentYyyymm", () => {
  it("packs the injected clock, one-based on the month", () => {
    expect(currentYyyymm(new Date(2026, 0, 15))).toBe(202_601);
    expect(currentYyyymm(new Date(2026, 11, 1))).toBe(202_612);
  });

  it("defaults to now", () => {
    const now = new Date();

    expect(currentYyyymm()).toBe(now.getFullYear() * 100 + now.getMonth() + 1);
  });
});

describe("addMonths", () => {
  it("advances within the year", () => {
    expect(addMonths(202_601, 3)).toBe(202_604);
  });

  it("crosses December into January", () => {
    expect(addMonths(202_612, 1)).toBe(202_701);
  });

  it("goes backwards across the year boundary", () => {
    expect(addMonths(202_601, -1)).toBe(202_512);
  });

  it("is the identity for zero", () => {
    expect(addMonths(202_608, 0)).toBe(202_608);
  });
});

describe("buildMonths", () => {
  it("enumerates start..end inclusive", () => {
    expect(buildMonths(202_611, 202_702)).toEqual([
      202_611, 202_612, 202_701, 202_702,
    ]);
  });

  it("yields the single month when start equals end", () => {
    expect(buildMonths(202_608, 202_608)).toEqual([202_608]);
  });

  it("yields [] when start is after end", () => {
    expect(buildMonths(202_702, 202_611)).toEqual([]);
  });
});

describe("formatYyyymm", () => {
  it("renders label and 2-digit year", () => {
    expect(formatYyyymm(202_608)).toBe("Ago/26");
    expect(formatYyyymm(200_001)).toBe("Jan/00");
  });

  it("renders a muted placeholder for null", () => {
    expect(formatYyyymm(null)).toBe("—");
  });
});

describe("yearOptions", () => {
  it("spans 2000..2099 inclusive", () => {
    const years = yearOptions();

    expect(years).toHaveLength(100);
    expect(years.at(0)).toBe(2000);
    expect(years.at(-1)).toBe(2099);
  });
});

describe("MONTH_LABELS", () => {
  it("has one pt-BR label per month", () => {
    expect(MONTH_LABELS).toHaveLength(12);
    expect(MONTH_LABELS[0]).toBe("Jan");
  });
});
