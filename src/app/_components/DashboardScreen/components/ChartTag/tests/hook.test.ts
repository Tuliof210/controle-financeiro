import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import {
  TAG_CHAR_PX,
  TAG_HEIGHT,
  TAG_PAD_X,
  TAG_TONES,
} from "@/app/_components/DashboardScreen/chart-marks.config.ts";
import { useChartTag } from "@/app/_components/DashboardScreen/components/ChartTag/hook.ts";

const tag = (x = 100, plotWidth = 800, label = "ABC") =>
  renderHook(() => useChartTag({ x, y: 40, label, tone: "caution", plotWidth }))
    .result.current;

const BOX = "ABC".length * TAG_CHAR_PX + TAG_PAD_X * 2;

describe("useChartTag", () => {
  it("measures its own box from its label", () => {
    // Read from the constants, not re-typed: the per-character advance is a
    // measurement of the mono face and moves whenever the face or --text-2xs
    // does, and a literal here turns that into a red test rather than a fact.
    expect(tag().width).toBe(BOX);
    expect(tag().height).toBe(TAG_HEIGHT);
  });

  it("hangs right of x while there is room for the whole box", () => {
    expect(tag(100, 800).left).toBe(100);
  });

  // The old rule flipped past the plot's MIDPOINT, decided by the caller. With
  // ~97px of label and about one band of room, that clipped `PROJETADO` mid-word.
  it("hangs left of x instead when the box would not fit right of it", () => {
    expect(tag(BOX + 40, BOX + 60).left).toBe(40);
  });

  // The other half of the old bug: a flip near the left edge produced a NEGATIVE
  // left and clipped on the opposite side.
  it("never places the box off the plot's leading edge", () => {
    expect(tag(10, 800).left).toBe(10);
    expect(tag(5, BOX + 10).left).toBeGreaterThanOrEqual(0);
  });

  // The invariant, not a specific number: wherever it lands, the whole box is
  // inside the plot. This is what the clip was violating.
  it("keeps the whole box inside the plot at every x", () => {
    for (const x of [0, 5, 40, 200, 780, 790, 800]) {
      const { left, width } = tag(x, 800);

      expect(left).toBeGreaterThanOrEqual(0);
      expect(left + width).toBeLessThanOrEqual(800);
    }
  });

  // A plot narrower than the label shows the label's START, not its middle.
  it("falls back to the leading edge when the plot is narrower than the box", () => {
    expect(tag(50, BOX - 20).left).toBe(0);
  });

  it("sets the text baseline as a fraction of the height", () => {
    expect(tag().textY).toBe(40 + TAG_HEIGHT * 0.7);
    expect(tag().textX).toBe(100 + TAG_PAD_X);
  });

  it("takes the fill and text colour the tone pairs", () => {
    expect(tag().colors).toBe(TAG_TONES.caution);
  });
});
