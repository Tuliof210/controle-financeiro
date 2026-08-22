import { describe, expect, it } from "@jest/globals";
import { colorOf } from "@/components/Avatar/color.helper.ts";

const CAT_TOKEN = /^var\(--cat-(violet|lime|magenta|green|red|amber|cyan)\)$/;

describe("colorOf", () => {
  it("hashes a name onto a --cat-* token", () => {
    expect(colorOf("Ana Silva")).toMatch(CAT_TOKEN);
  });

  it("is deterministic for the same name", () => {
    expect(colorOf("Família")).toBe(colorOf("Família"));
  });
});
