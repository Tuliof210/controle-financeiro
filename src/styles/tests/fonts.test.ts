import { describe, expect, it } from "@jest/globals";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import { clashDisplay, hankenGrotesk, ibmPlexMono } from "@/styles/fonts.ts";

// next/jest already mocks next/font, so the loader's RETURN says nothing about
// how it was called — and the CSS variable names are the whole contract with
// `src/styles/_tokens-type.scss`. Asserting the argument is what pins them.
// ONE factory for all three faces, not one per specifier: next/jest maps every
// `next/font/*` import to a single mock module, so a second jest.mock() for
// "next/font/local" would replace this one rather than sit beside it.
jest.mock("next/font/google", () => ({
  __esModule: true,
  default: jest.fn(() => ({ variable: "display", className: "display" })),
  Hanken_Grotesk: jest.fn(() => ({ variable: "sans", className: "sans" })),
  IBM_Plex_Mono: jest.fn(() => ({ variable: "mono", className: "mono" })),
}));

describe("clashDisplay", () => {
  it("loads the display face locally on the --font-display variable", () => {
    expect(localFont).toHaveBeenCalledWith({
      src: "./fonts/clash-display-600.woff2",
      weight: "600",
      display: "swap",
      variable: "--font-display",
    });
    expect(clashDisplay.variable).toBe("display");
  });
});

describe("hankenGrotesk", () => {
  it("loads the body face on the --font-sans variable", () => {
    expect(Hanken_Grotesk).toHaveBeenCalledWith({
      subsets: ["latin"],
      variable: "--font-sans",
    });
    expect(hankenGrotesk.variable).toBe("sans");
  });
});

describe("ibmPlexMono", () => {
  it("loads the mono face on the --font-mono variable", () => {
    expect(IBM_Plex_Mono).toHaveBeenCalledWith({
      weight: ["400", "500", "600"],
      subsets: ["latin"],
      variable: "--font-mono",
    });
    expect(ibmPlexMono.variable).toBe("mono");
  });
});
