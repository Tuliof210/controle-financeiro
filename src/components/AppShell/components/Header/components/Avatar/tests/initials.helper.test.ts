import { describe, expect, it } from "@jest/globals";
import { getInitials } from "@/components/AppShell/components/Header/components/Avatar/initials.helper.ts";

describe("getInitials", () => {
  it("takes the first letter of the first two words", () => {
    expect(getInitials("Ana Silva")).toBe("AS");
  });

  it("stops at two even for a longer name", () => {
    expect(getInitials("Ana Maria Silva")).toBe("AM");
  });

  it("yields one letter for a single word", () => {
    expect(getInitials("Família")).toBe("F");
  });

  it("ignores the gaps of a padded label", () => {
    expect(getInitials("  Ana   Silva ")).toBe("AS");
  });

  it("yields nothing for an empty label", () => {
    expect(getInitials("")).toBe("");
  });
});
