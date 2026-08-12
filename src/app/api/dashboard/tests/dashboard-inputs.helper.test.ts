/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  forecastsFor,
  limitFor,
  metaOf,
  targetCap,
} from "@/app/api/dashboard/dashboard-inputs.helper.ts";
import type { Forecast } from "@/core/entities/forecast.entity.ts";

const real = { id: "f1", simulated: false } as Forecast;
const simulated = { id: "f2", simulated: true } as Forecast;

describe("metaOf", () => {
  it("reads a saved goal as the Meta target", () => {
    expect(metaOf(50_000)).toBe(50_000);
  });

  it("reads zero and absent alike as unset", () => {
    expect(metaOf(0)).toBeNull();
    expect(metaOf(undefined)).toBeNull();
  });
});

describe("targetCap", () => {
  it("falls back to the default when Meta is asked for without one", () => {
    expect(targetCap("meta", null)).toBe("50");
  });

  it("keeps Meta when there is a goal", () => {
    expect(targetCap("meta", 50_000)).toBe("meta");
  });

  it("leaves a percentage target alone", () => {
    expect(targetCap("75", null)).toBe("75");
  });
});

describe("forecastsFor", () => {
  it("counts simulations under the all view", () => {
    expect(forecastsFor("all", [real, simulated])).toEqual([real, simulated]);
  });

  it("drops them entirely under the real view", () => {
    expect(forecastsFor("real", [real, simulated])).toEqual([real]);
  });
});

describe("limitFor", () => {
  it("caps only the Meta target", () => {
    expect(limitFor("meta", 50_000)).toBe(50_000);
  });

  it("leaves the percentage targets uncapped", () => {
    expect(limitFor("25", 50_000)).toBeNull();
  });
});
