import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useSettingsScreen } from "@/app/configuracoes/_components/SettingsScreen/hook.ts";

describe("useSettingsScreen", () => {
  it("names the screen in pt-BR", () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current).toEqual({
      eyebrow: "AJUSTES",
      title: "Configurações",
      subtitle: "Pessoas e objetivos da família.",
    });
  });
});
