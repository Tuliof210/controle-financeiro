/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  ceilingTargetOf,
  forecastsFor,
  goalsTargetOf,
  overHeadroomOf,
} from "@/app/api/dashboard/dashboard-inputs.helper.ts";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

const real = { id: "f1", simulated: false } as Forecast;
const simulated = { id: "f2", simulated: true } as Forecast;

const saved = (over: Partial<typeof DEFAULT_SETTINGS> = {}) => ({
  ...DEFAULT_SETTINGS,
  ...over,
});

describe("ceilingTargetOf", () => {
  it("reads the saved percentage while the mode is percent", () => {
    expect(ceilingTargetOf(saved({ ceilingPercent: 75 }))).toEqual({
      mode: "percent",
      percent: 75,
    });
  });

  it("reads the saved amount once the mode is fixed", () => {
    expect(
      ceilingTargetOf(saved({ ceilingMode: "fixed", ceilingCents: 40_000 })),
    ).toEqual({ mode: "fixed", cents: 40_000 });
  });
});

describe("goalsTargetOf", () => {
  it("reads the goals adjustment, not the ceiling's", () => {
    expect(
      goalsTargetOf(saved({ ceilingPercent: 75, goalsPercent: 10 })),
    ).toEqual({ mode: "percent", percent: 10 });
  });

  it("reads the saved amount once the mode is fixed", () => {
    expect(
      goalsTargetOf(saved({ goalsMode: "fixed", goalsCents: 20_000 })),
    ).toEqual({ mode: "fixed", cents: 20_000 });
  });
});

describe("forecastsFor", () => {
  it("counts simulations once the Perfil asks for them", () => {
    expect(forecastsFor(true, [real, simulated])).toEqual([real, simulated]);
  });

  it("drops them entirely while it does not", () => {
    expect(forecastsFor(false, [real, simulated])).toEqual([real]);
  });
});

describe("overHeadroomOf", () => {
  it("says nothing while both adjustments are percentages", () => {
    expect(overHeadroomOf(saved({ ceilingPercent: 100 }), 0)).toBe(false);
  });

  it("catches a fixed ceiling above what the period carries", () => {
    const settings = saved({ ceilingMode: "fixed", ceilingCents: 1001 });

    expect(overHeadroomOf(settings, 1000)).toBe(true);
    expect(overHeadroomOf(settings, 1001)).toBe(false);
  });

  it("catches a fixed goals amount above it too", () => {
    const settings = saved({ goalsMode: "fixed", goalsCents: 1001 });

    expect(overHeadroomOf(settings, 1000)).toBe(true);
    expect(overHeadroomOf(settings, 1001)).toBe(false);
  });
});
