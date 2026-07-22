import { describe, expect, it } from "vitest";
import { getGreeting } from "./greeting.helper";

describe("getGreeting", () => {
  it.each([
    [0, "Bom dia"],
    [11, "Bom dia"],
    [12, "Boa tarde"],
    [17, "Boa tarde"],
    [18, "Boa noite"],
    [23, "Boa noite"],
  ])("returns %s at %s h", (hour, expected) => {
    expect(getGreeting(new Date(2020, 0, 1, hour))).toBe(expected);
  });
});
