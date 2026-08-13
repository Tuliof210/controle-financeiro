import { describe, expect, it } from "@jest/globals";
import {
  PROJECTED_BAND_FILL,
  projectedRuleProps,
  TAG_CHAR_PX,
  TAG_HEIGHT,
  TAG_LABEL_PROPS,
  TAG_PAD_X,
  TAG_TONES,
  TIGHTEST_RULE_DASHARRAY,
} from "@/app/_components/DashboardScreen/chart-marks.config.ts";

describe("projected marks", () => {
  it("washes the band with a raised surface, never a signal colour", () => {
    expect(PROJECTED_BAND_FILL).toBe("var(--color-surface-raised)");
  });

  it("carries the meaning on a dashed rule instead", () => {
    expect(projectedRuleProps.strokeDasharray).toBe("6 5");
    expect(TIGHTEST_RULE_DASHARRAY).toBe("4 4");
  });
});

describe("TAG_TONES", () => {
  it("pairs each fill with the token that reads on it", () => {
    expect(TAG_TONES.muted).toEqual({
      fill: "var(--color-text-muted)",
      text: "var(--color-bg)",
    });
    expect(TAG_TONES.caution).toEqual({
      fill: "var(--color-caution)",
      text: "var(--color-bg)",
    });
  });
});

describe("tag geometry", () => {
  it("measures a tag box from its own label", () => {
    expect(TAG_CHAR_PX).toBeGreaterThan(0);
    expect(TAG_PAD_X).toBeGreaterThan(0);
    expect(TAG_HEIGHT).toBeGreaterThan(0);
    expect(TAG_LABEL_PROPS.fontFamily).toBe("var(--font-mono)");
  });
});
