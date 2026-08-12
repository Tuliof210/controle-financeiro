/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { PALETTE } from "@/lib/palette.ts";

describe("PALETTE", () => {
  it("offers the seven person colours", () => {
    expect(PALETTE).toEqual([
      "violet",
      "lime",
      "magenta",
      "green",
      "red",
      "amber",
      "cyan",
    ]);
  });

  it("has no duplicate, so two people can be told apart", () => {
    expect(new Set(PALETTE).size).toBe(PALETTE.length);
  });
});
