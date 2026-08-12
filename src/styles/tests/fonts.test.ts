import { describe, expect, it } from "@jest/globals";
import { jetBrainsMono, pressStart2P } from "@/styles/fonts.ts";

// next/jest mocks next/font, so this asserts the wiring the layout depends on:
// each font exposes the CSS variable the tokens read.
describe("fonts", () => {
  it("exposes the display font as --font-display", () => {
    expect(pressStart2P.variable).toBeTruthy();
    expect(pressStart2P.className).toBeTruthy();
  });

  it("exposes the mono font as --font-mono", () => {
    expect(jetBrainsMono.variable).toBeTruthy();
    expect(jetBrainsMono.className).toBeTruthy();
  });
});
