import { describe, expect, it } from "vitest";
import { getInitials } from "./initials.helper";

describe("getInitials", () => {
  it.each([
    ["Ana Silva", "AS"],
    ["Família", "F"],
    ["ana maria da silva", "AM"],
    ["  Ana   Silva  ", "AS"],
    ["", ""],
  ])("maps %j to %j", (label, expected) => {
    expect(getInitials(label)).toBe(expected);
  });
});
