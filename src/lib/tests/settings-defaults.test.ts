/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { SETTING_MODES } from "@/core/entities/settings.entity.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

describe("DEFAULT_SETTINGS", () => {
  it("starts both adjustments on a mode the route accepts", () => {
    expect(SETTING_MODES).toContain(DEFAULT_SETTINGS.ceilingMode);
    expect(SETTING_MODES).toContain(DEFAULT_SETTINGS.goalsMode);
  });

  // The two tuples these used to be checked against are gone with the selectors
  // that travelled on them: the saved row is now the only place either figure
  // lives, so the values are pinned here directly.
  it("reproduces the ceiling target the dashboard defaulted to", () => {
    expect(DEFAULT_SETTINGS.ceilingPercent).toBe(50);
  });

  it("leaves simulated forecasts out, as the board always did", () => {
    expect(DEFAULT_SETTINGS.showSimulated).toBe(false);
  });

  it("reads both fixed amounts as unset", () => {
    expect(DEFAULT_SETTINGS.ceilingCents).toBe(0);
    expect(DEFAULT_SETTINGS.goalsCents).toBe(0);
  });

  it("saves the pace divisor as the objectives share", () => {
    expect(DEFAULT_SETTINGS.goalsPercent).toBe(25);
  });
});
