/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { DEFAULT_SIMULATION_VIEW, SIMULATION_VIEWS } from "@/lib/simulation.ts";

describe("SIMULATION_VIEWS", () => {
  it("offers exactly the real and all views", () => {
    expect(SIMULATION_VIEWS).toEqual(["real", "all"]);
  });

  it("leaves simulated forecasts out by default", () => {
    expect(DEFAULT_SIMULATION_VIEW).toBe("real");
    expect(SIMULATION_VIEWS).toContain(DEFAULT_SIMULATION_VIEW);
  });
});
