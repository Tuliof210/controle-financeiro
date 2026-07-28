import { describe, expect, it } from "vitest";
import { DESKTOP_PLOT_WIDTH, formatYTickFor } from "./chart.config";

describe("formatYTickFor", () => {
  it("keeps the full formatter at and above the desktop width", () => {
    expect(formatYTickFor(DESKTOP_PLOT_WIDTH)(123456)).toBe("R$ 1.234");
  });

  it("switches to the compact K formatter below the desktop width", () => {
    expect(formatYTickFor(DESKTOP_PLOT_WIDTH - 1)(123456)).toBe("R$ 1,2K");
  });
});
