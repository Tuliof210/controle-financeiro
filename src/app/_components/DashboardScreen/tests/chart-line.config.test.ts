import { describe, expect, it } from "@jest/globals";
import {
  LINE_PROPS,
  TETO_LINE_PROPS,
} from "@/app/_components/DashboardScreen/chart-line.config.ts";

describe("chart line strokes", () => {
  it("keeps the teto series a second colour, never a dash", () => {
    expect(LINE_PROPS.stroke).toBe("var(--color-brand)");
    expect(TETO_LINE_PROPS).toEqual({
      stroke: "var(--color-text-secondary)",
      strokeWidth: 2,
    });
  });
});
