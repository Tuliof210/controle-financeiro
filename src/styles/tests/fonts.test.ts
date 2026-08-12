import { describe, expect, it } from "@jest/globals";
import { JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { jetBrainsMono, pressStart2P } from "@/styles/fonts.ts";

// next/jest already mocks next/font, so the loader's RETURN says nothing about
// how it was called — and the CSS variable names are the whole contract with
// `src/styles/_tokens.scss`. Asserting the argument is what pins them.
jest.mock("next/font/google", () => ({
  JetBrains_Mono: jest.fn(() => ({ variable: "mono", className: "mono" })),
  Press_Start_2P: jest.fn(() => ({
    variable: "display",
    className: "display",
  })),
}));

describe("pressStart2P", () => {
  it("loads the display face on the --font-display variable", () => {
    expect(Press_Start_2P).toHaveBeenCalledWith({
      weight: "400",
      subsets: ["latin"],
      variable: "--font-display",
    });
    expect(pressStart2P.variable).toBe("display");
  });
});

describe("jetBrainsMono", () => {
  it("loads the mono face on the --font-mono variable", () => {
    expect(JetBrains_Mono).toHaveBeenCalledWith({
      subsets: ["latin"],
      variable: "--font-mono",
    });
    expect(jetBrainsMono.variable).toBe("mono");
  });
});
