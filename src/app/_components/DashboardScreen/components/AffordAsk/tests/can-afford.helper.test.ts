import { describe, expect, it } from "@jest/globals";
import { canAfford } from "@/app/_components/DashboardScreen/components/AffordAsk/can-afford.helper.ts";

describe("canAfford", () => {
  it("names the remainder when the amount fits", () => {
    expect(canAfford(100, 250)).toEqual({ ok: true, remainingCents: 150 });
  });

  it("names the shortfall when the amount does not fit", () => {
    expect(canAfford(400, 250)).toEqual({ ok: false, shortfallCents: 150 });
  });

  it("fits when the amount equals the ceiling", () => {
    expect(canAfford(250, 250)).toEqual({ ok: true, remainingCents: 0 });
  });
});
