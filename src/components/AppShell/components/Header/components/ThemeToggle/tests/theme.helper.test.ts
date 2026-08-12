import { describe, expect, it } from "@jest/globals";
import {
  flipTheme,
  iconFor,
  normalizeTheme,
  toggleLabel,
} from "@/components/AppShell/components/Header/components/ThemeToggle/theme.helper.ts";

describe("normalizeTheme", () => {
  it("reads dark as dark and everything else as light", () => {
    expect(normalizeTheme("dark")).toBe("dark");
    expect(normalizeTheme("light")).toBe("light");
    expect(normalizeTheme(null)).toBe("light");
    expect(normalizeTheme("sepia")).toBe("light");
  });
});

describe("flipTheme", () => {
  it("swaps the two themes", () => {
    expect(flipTheme("dark")).toBe("light");
    expect(flipTheme("light")).toBe("dark");
  });
});

describe("toggleLabel", () => {
  it("names the theme the button switches to", () => {
    expect(toggleLabel("dark")).toBe("Ativar tema claro");
    expect(toggleLabel("light")).toBe("Ativar tema escuro");
  });

  it("reads as light before hydration", () => {
    expect(toggleLabel(null)).toBe("Ativar tema escuro");
  });
});

describe("iconFor", () => {
  it("holds an empty slot before hydration", () => {
    expect(iconFor(null)).toBe("none");
  });

  it("shows the glyph of the theme the button switches to", () => {
    expect(iconFor("dark")).toBe("sun");
    expect(iconFor("light")).toBe("moon");
  });
});
