import { describe, expect, it } from "@jest/globals";
import { formatToday } from "@/components/AppShell/components/Header/today.helper.ts";

describe("formatToday", () => {
  it("renders the pt-BR date in caps, without the abbreviation dots", () => {
    expect(formatToday(new Date(2026, 6, 26))).toBe("DOM, 26 JUL 2026");
  });

  it("keeps the two-digit day", () => {
    expect(formatToday(new Date(2026, 0, 5))).toContain("05 JAN 2026");
  });
});
