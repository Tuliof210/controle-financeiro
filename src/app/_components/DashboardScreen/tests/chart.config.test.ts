import { describe, expect, it } from "@jest/globals";
import {
  axisProps,
  isDesktopWidth,
  MARGIN,
  MONTHS_DESKTOP,
  MONTHS_MOBILE,
  monthWindowSize,
  TICK_LABEL_PROPS,
  tickFormatterFor,
  Y_TICKS,
} from "@/app/_components/DashboardScreen/chart.config.ts";
import { formatMoneyShort, formatMoneyShortK } from "@/lib/money.ts";

describe("isDesktopWidth", () => {
  it("switches on the measured plot width, not the viewport", () => {
    expect(isDesktopWidth(768)).toBe(true);
    expect(isDesktopWidth(767)).toBe(false);
  });
});

describe("monthWindowSize", () => {
  it("windows twelve months on the wide plot and six on the narrow one", () => {
    expect(monthWindowSize(884)).toBe(MONTHS_DESKTOP);
    expect(monthWindowSize(291)).toBe(MONTHS_MOBILE);
  });
});

describe("tickFormatterFor", () => {
  it("uses the full label where the gutter has room", () => {
    expect(tickFormatterFor(884)).toBe(formatMoneyShort);
  });

  it("drops to the compact K label on the narrow plot", () => {
    expect(tickFormatterFor(291)).toBe(formatMoneyShortK);
  });
});

describe("shared geometry", () => {
  it("leaves the left margin to be derived per chart", () => {
    expect(MARGIN).toEqual({ top: 8, right: 8, bottom: 28 });
    expect(Y_TICKS).toBe(4);
  });

  it("styles the axis and its labels from DS tokens", () => {
    expect(axisProps.stroke).toContain("var(--color-border)");
    expect(TICK_LABEL_PROPS.fill).toContain("var(--color-text-muted)");
  });
});
