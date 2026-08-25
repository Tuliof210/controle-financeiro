import { describe, expect, it } from "@jest/globals";
import { goalsLede } from "@/app/perfil/_components/SettingsScreen/goals-lede.helper.ts";

describe("goalsLede", () => {
  it("leads with the percent of this month's teto", () => {
    expect(goalsLede("ok", "percent", 50)).toContain("50%");
    expect(goalsLede("ok", "percent", 50)).toContain("teto de gastos");
  });

  it("names the empty period instead of inventing a figure", () => {
    expect(goalsLede("empty", "percent", 50)).toContain("ainda");
  });

  it("names a failed dashboard without claiming there is no period", () => {
    expect(goalsLede("error", "percent", 50)).toContain(
      "Não foi possível calcular o limite",
    );
  });
});
