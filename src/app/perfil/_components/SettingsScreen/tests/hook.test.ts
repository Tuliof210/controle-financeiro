import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useSettingsScreen } from "@/app/perfil/_components/SettingsScreen/hook.ts";

describe("useSettingsScreen", () => {
  it("names the screen in pt-BR", () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current).toEqual({
      title: "Perfil",
      subtitle: "Pessoas, objetivos e como o dashboard exibe seus números.",
    });
  });
});
