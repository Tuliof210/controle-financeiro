import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useModeToggle } from "@/app/perfil/_components/SettingsScreen/components/ModeToggle/hook.ts";

describe("useModeToggle", () => {
  it("offers both modes, marking the current one", () => {
    const { result } = renderHook(() =>
      useModeToggle({
        name: "ceiling-mode",
        legend: "Como definir",
        value: "fixed",
        onChange: jest.fn(),
      }),
    );

    expect(result.current.segments).toEqual([
      expect.objectContaining({
        mode: "percent",
        label: "Porcentagem",
        checked: false,
      }),
      expect.objectContaining({
        mode: "fixed",
        label: "Valor fixo",
        checked: true,
      }),
    ]);
  });

  it("carries the group name it was given, never a constant", () => {
    const { result } = renderHook(() =>
      useModeToggle({
        name: "goals-mode",
        legend: "Como definir",
        value: "percent",
        onChange: jest.fn(),
      }),
    );

    expect(result.current.name).toBe("goals-mode");
    expect(result.current.legend).toBe("Como definir");
  });

  it("binds each segment to its own choice", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useModeToggle({
        name: "ceiling-mode",
        legend: "Como definir",
        value: "percent",
        onChange,
      }),
    );

    result.current.segments[1]?.select();

    expect(onChange).toHaveBeenCalledWith("fixed");
  });
});
