import { describe, expect, it } from "@jest/globals";
import { clampPercent } from "@/app/perfil/_components/SettingsScreen/percent.helper.ts";

describe("clampPercent", () => {
  it("keeps a percentage inside the range", () => {
    expect(clampPercent("0")).toBe(0);
    expect(clampPercent("42")).toBe(42);
    expect(clampPercent("100")).toBe(100);
  });

  it("saturates above one hundred instead of refusing", () => {
    expect(clampPercent("250")).toBe(100);
    expect(clampPercent("999")).toBe(100);
  });

  it("reads an empty field as zero", () => {
    expect(clampPercent("")).toBe(0);
  });

  it("drops everything that is not a digit", () => {
    expect(clampPercent("abc")).toBe(0);
    expect(clampPercent("5%")).toBe(5);
    expect(clampPercent("-30")).toBe(30);
    expect(clampPercent("1,5")).toBe(15);
  });
});
