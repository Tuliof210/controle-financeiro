import { describe, expect, it } from "vitest";
import {
  addMonths,
  buildMonths,
  composeYYYYMM,
  currentYYYYMM,
  formatYyyymm,
  splitYYYYMM,
  yearOptions,
} from "./months";

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

describe("addMonths", () => {
  it("returns the input for a count of zero", () => {
    expect(addMonths(202607, 0)).toBe(202607);
  });

  it("advances within the same year", () => {
    expect(addMonths(202603, 4)).toBe(202607);
  });

  it("crosses a year boundary", () => {
    expect(addMonths(202611, 3)).toBe(202702);
  });

  it("lands on December rather than month zero", () => {
    expect(addMonths(202601, 11)).toBe(202612);
  });

  it("spans several years", () => {
    expect(addMonths(202607, 30)).toBe(202901);
  });
});

describe("yearOptions", () => {
  it("spans a fixed 2000..2099, regardless of the current year", () => {
    const years = yearOptions();
    expect(years[0]).toBe(2000);
    expect(years.at(-1)).toBe(2099);
    expect(years).toHaveLength(100);
  });
});

describe("buildMonths", () => {
  it("enumerates every month between start and end inclusive", () => {
    expect(buildMonths(202608, 202612)).toEqual([
      202608, 202609, 202610, 202611, 202612,
    ]);
  });

  it("wraps across a year boundary", () => {
    expect(buildMonths(202511, 202602)).toEqual([
      202511, 202512, 202601, 202602,
    ]);
  });

  it("returns a single-element list for a single-month period", () => {
    expect(buildMonths(202612, 202612)).toEqual([202612]);
  });

  it("returns an empty list when start is after end", () => {
    expect(buildMonths(202612, 202601)).toEqual([]);
  });
});

describe("formatYyyymm", () => {
  it("formats a YYYYMM integer as Mon/YY", () => {
    expect(formatYyyymm(202501)).toBe("Jan/25");
    expect(formatYyyymm(202608)).toBe("Ago/26");
    expect(formatYyyymm(202808)).toBe("Ago/28");
  });

  it("returns a muted placeholder for null", () => {
    expect(formatYyyymm(null)).toBe("—");
  });
});
