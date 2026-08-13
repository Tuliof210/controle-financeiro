import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import {
  TAG_CHAR_PX,
  TAG_HEIGHT,
  TAG_PAD_X,
  TAG_TONES,
} from "@/app/_components/DashboardScreen/chart-marks.config.ts";
import { useChartTag } from "@/app/_components/DashboardScreen/components/ChartTag/hook.ts";

const tag = (flip?: boolean) =>
  renderHook(() =>
    useChartTag({ x: 100, y: 40, label: "ABC", tone: "caution", flip }),
  ).result.current;

describe("useChartTag", () => {
  it("measures its own box from its label", () => {
    // Read from the constants, not re-typed: the per-character advance is a
    // measurement of the mono face and moves whenever the face or --text-2xs
    // does, and a literal here turns that into a red test rather than a fact.
    expect(tag().width).toBe("ABC".length * TAG_CHAR_PX + TAG_PAD_X * 2);
    expect(tag().height).toBe(TAG_HEIGHT);
  });

  it("anchors left of x by default", () => {
    expect(tag().left).toBe(100);
  });

  it("hangs the box the other way when it would run off the edge", () => {
    expect(tag(true).left).toBe(100 - tag().width);
  });

  it("sets the text baseline as a fraction of the height", () => {
    expect(tag().textY).toBe(40 + TAG_HEIGHT * 0.7);
    expect(tag().textX).toBe(100 + TAG_PAD_X);
  });

  it("takes the fill and text colour the tone pairs", () => {
    expect(tag().colors).toBe(TAG_TONES.caution);
  });
});
