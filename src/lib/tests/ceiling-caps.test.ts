/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  CEILING_CAPS,
  capPercent,
  DEFAULT_CEILING_CAP,
  META_CAP,
} from "@/lib/ceiling-caps.ts";

describe("CEILING_CAPS", () => {
  it("lists the three percentages plus meta, in order", () => {
    expect(CEILING_CAPS).toEqual(["25", "50", "75", "meta"]);
  });

  it("defaults to a member of the tuple", () => {
    expect(CEILING_CAPS).toContain(DEFAULT_CEILING_CAP);
    expect(DEFAULT_CEILING_CAP).toBe("50");
  });
});

describe("capPercent", () => {
  it("reads a percentage cap as its number", () => {
    expect(capPercent("25")).toBe(25);
    expect(capPercent("75")).toBe(75);
  });

  it("reads meta as the whole headroom", () => {
    expect(capPercent(META_CAP)).toBe(100);
  });

  it("never yields NaN for any member of the tuple", () => {
    for (const cap of CEILING_CAPS) {
      expect(Number.isNaN(capPercent(cap))).toBe(false);
    }
  });
});
