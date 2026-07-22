import { describe, expect, it } from "vitest";
import {
  composeYYYYMM,
  currentYYYYMM,
  splitYYYYMM,
  yearOptions,
} from "./month.helper";

describe("splitYYYYMM", () => {
  it("splits a YYYYMM integer into year and month", () => {
    expect(splitYYYYMM(202603)).toEqual({ year: 2026, month: 3 });
  });
});

describe("composeYYYYMM", () => {
  it("composes year and month back into a YYYYMM integer", () => {
    expect(composeYYYYMM(2026, 3)).toBe(202603);
  });
});

describe("currentYYYYMM", () => {
  it("derives YYYYMM from the given date", () => {
    expect(currentYYYYMM(new Date(2026, 6, 22))).toBe(202607);
  });
});

describe("yearOptions", () => {
  it("spans currentYear - 3 .. currentYear + 8", () => {
    const years = yearOptions(2026);
    expect(years[0]).toBe(2023);
    expect(years.at(-1)).toBe(2034);
    expect(years).toHaveLength(12);
  });
});
