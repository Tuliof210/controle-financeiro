import { describe, expect, it } from "@jest/globals";
import {
  bandwidthFor,
  CHAR_PX,
  leftMargin,
  MIN_TICK_GAP,
  X_LABEL_WIDTH,
} from "@/app/_components/DashboardScreen/chart-gutter.helper.ts";

describe("leftMargin", () => {
  it("sizes the gutter on the widest label, plus the tick gap", () => {
    expect(leftMargin(["R$ 1", "−R$ 20.000"])).toBe(
      "−R$ 20.000".length * CHAR_PX + 12,
    );
  });

  it("still leaves the tick its gap when there is no label", () => {
    expect(leftMargin([])).toBe(12);
  });
});

describe("bandwidthFor", () => {
  it("fits exactly one window into the visible plot", () => {
    expect(bandwidthFor(600, 12)).toBe(50);
  });

  it("yields nothing for a window of no months", () => {
    expect(bandwidthFor(600, 0)).toBe(0);
  });
});

describe("label measurements", () => {
  it("sizes a month label at six mono characters", () => {
    expect(X_LABEL_WIDTH).toBe(6 * CHAR_PX);
    expect(MIN_TICK_GAP).toBeGreaterThan(0);
  });
});
