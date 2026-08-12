/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { CURRENCY_PREFIX, ERROR_GLYPH, MINUS_GLYPH } from "@/lib/glyphs.ts";

describe("glyphs", () => {
  it("draws the error affordance as a single triangle", () => {
    expect(ERROR_GLYPH).toBe("▲");
  });

  it("uses U+2212 as the minus sign, not the hyphen", () => {
    expect(MINUS_GLYPH).toBe("−");
    expect(MINUS_GLYPH).not.toBe("-");
  });

  it("prefixes money with the Brazilian currency mark", () => {
    expect(CURRENCY_PREFIX).toBe("R$");
  });
});
