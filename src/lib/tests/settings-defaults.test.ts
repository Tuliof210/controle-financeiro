/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { SETTING_MODES } from "@/core/entities/settings.entity.ts";
import { DEFAULT_CEILING_CAP } from "@/lib/ceiling-caps.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";
import { DEFAULT_SIMULATION_VIEW } from "@/lib/simulation.ts";

describe("DEFAULT_SETTINGS", () => {
  it("starts both adjustments on a mode the route accepts", () => {
    expect(SETTING_MODES).toContain(DEFAULT_SETTINGS.ceilingMode);
    expect(SETTING_MODES).toContain(DEFAULT_SETTINGS.goalsMode);
  });

  it("reproduces the ceiling target the dashboard already defaults to", () => {
    expect(String(DEFAULT_SETTINGS.ceilingPercent)).toBe(DEFAULT_CEILING_CAP);
  });

  it("leaves simulated forecasts out, like the default dashboard view", () => {
    expect(DEFAULT_SETTINGS.showSimulated).toBe(
      DEFAULT_SIMULATION_VIEW === "all",
    );
  });

  it("reads both fixed amounts as unset", () => {
    expect(DEFAULT_SETTINGS.ceilingCents).toBe(0);
    expect(DEFAULT_SETTINGS.goalsCents).toBe(0);
  });

  it("saves the pace divisor as the objectives share", () => {
    expect(DEFAULT_SETTINGS.goalsPercent).toBe(25);
  });
});
