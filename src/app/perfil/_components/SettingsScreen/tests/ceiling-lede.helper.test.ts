import { describe, expect, it } from "@jest/globals";
import { ceilingLede } from "@/app/perfil/_components/SettingsScreen/ceiling-lede.helper.ts";
import { maxHint } from "@/app/perfil/_components/SettingsScreen/max-hint.helper.ts";

describe("ceilingLede", () => {
  it("leads with the percent that produced this month's teto", () => {
    expect(ceilingLede("ok", "percent", 50)).toContain("50%");
  });

  it("names the empty period instead of inventing a figure", () => {
    expect(ceilingLede("empty", "percent", 50)).toContain("ainda");
  });

  it("names a failed dashboard without claiming there is no period", () => {
    expect(ceilingLede("error", "percent", 50)).toContain(
      "Não foi possível calcular o teto",
    );
  });
});

describe("maxHint", () => {
  it("names the headroom a fixed amount may not pass", () => {
    expect(maxHint("ok", 50_000)).toContain("R$ 500,00");
  });

  it("does not claim an empty period when the dashboard failed", () => {
    expect(maxHint("error", null)).toContain("Não foi possível calcular");
    expect(maxHint("error", null)).not.toContain("Sem previsões");
  });
});
