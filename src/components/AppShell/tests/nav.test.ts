import { describe, expect, it } from "@jest/globals";
import { isActiveNav, NAV } from "@/components/AppShell/nav.ts";

describe("NAV", () => {
  it("lists the five screens in reading order", () => {
    expect(NAV.map((entry) => entry.href)).toEqual([
      "/",
      "/movimentacoes",
      "/previsoes",
      "/leitor-ofx",
      "/configuracoes",
    ]);
  });

  it("gives every destination a label and an icon", () => {
    for (const entry of NAV) {
      expect(entry.label).toBeTruthy();
      expect(entry.icon).toBeTruthy();
    }
  });
});

describe("isActiveNav", () => {
  it("lights the entry whose href is the current path", () => {
    expect(isActiveNav("/previsoes", "/previsoes")).toBe(true);
  });

  it("does not light Dashboard on every screen", () => {
    expect(isActiveNav("/previsoes", "/")).toBe(false);
  });

  it("does not prefix-match", () => {
    expect(isActiveNav("/movimentacoes/1", "/movimentacoes")).toBe(false);
  });
});
