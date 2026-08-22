import { describe, expect, it } from "@jest/globals";
import { initialsOf } from "@/components/Avatar/initials.helper.ts";

describe("initialsOf", () => {
  it("takes the first letter of the first and last words", () => {
    expect(initialsOf("Ana Silva")).toBe("AS");
  });

  it("skips middle names", () => {
    expect(initialsOf("Ana Maria Silva")).toBe("AS");
  });

  it("takes the first two letters of a single word", () => {
    expect(initialsOf("Família")).toBe("FA");
  });

  it("ignores the gaps of a padded label", () => {
    expect(initialsOf("  Ana   Silva ")).toBe("AS");
  });

  it("yields a placeholder for an empty label", () => {
    expect(initialsOf("")).toBe("?");
  });
});
