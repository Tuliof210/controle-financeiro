import { describe, expect, it } from "vitest";
import { formatToday } from "./today.helper";

describe("formatToday", () => {
  // 2026-07-26 is a Sunday, so the week walks Sunday -> Saturday from there.
  it.each([
    [26, "DOM"],
    [27, "SEG"],
    [28, "TER"],
    [29, "QUA"],
    [30, "QUI"],
    [31, "SEX"],
    [1, "SÁB"],
  ])("abbreviates the weekday of Jul/Aug %i as %s", (day, weekday) => {
    const date = new Date(2026, day === 1 ? 7 : 6, day);
    expect(formatToday(date).startsWith(`${weekday}, `)).toBe(true);
  });

  it("renders the full line, dotless and uppercased", () => {
    expect(formatToday(new Date(2026, 6, 26))).toBe("DOM, 26 JUL 2026");
  });

  it("uses the month's own abbreviation", () => {
    expect(formatToday(new Date(2026, 11, 1))).toBe("TER, 01 DEZ 2026");
  });
});
