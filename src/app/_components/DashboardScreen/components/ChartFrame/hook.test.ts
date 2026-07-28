import { describe, expect, it } from "vitest";
import { DESKTOP_PLOT_WIDTH } from "../../chart.config";
import type { buildFrame } from "../../chart-frame.helper";
import { useChartFrame } from "./hook";

// useChartFrame calls no React hook, so it runs under the node-environment
// Vitest config like its siblings. frame/children/title pass straight
// through untouched — only formatYTick has a branch worth testing.
const frame = {} as ReturnType<typeof buildFrame>;
const run = (width: number) =>
  useChartFrame({ title: "t", width, height: 260, frame, children: null });

describe("useChartFrame", () => {
  it("keeps the full formatter at and above the desktop width", () => {
    expect(run(DESKTOP_PLOT_WIDTH).formatYTick(123456)).toBe("R$ 1.234");
  });

  it("switches to the compact K formatter below the desktop width", () => {
    expect(run(DESKTOP_PLOT_WIDTH - 1).formatYTick(123456)).toBe("R$ 1,2K");
  });
});
