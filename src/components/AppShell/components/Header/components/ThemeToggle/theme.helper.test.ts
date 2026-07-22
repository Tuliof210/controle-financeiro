import { describe, expect, it } from "vitest";
import { flipTheme, normalizeTheme } from "./theme.helper";

describe("normalizeTheme", () => {
  it.each([
    ["dark", "dark"],
    ["light", "light"],
    [null, "light"],
    ["", "light"],
    ["anything-else", "light"],
  ])("normalizes %s to %s", (value, expected) => {
    expect(normalizeTheme(value)).toBe(expected);
  });
});

describe("flipTheme", () => {
  it.each([
    ["dark", "light"],
    ["light", "dark"],
  ])("flips %s to %s", (current, expected) => {
    expect(flipTheme(current)).toBe(expected);
  });
});
