import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useKindToggle } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/KindToggle/hook.ts";

describe("useKindToggle", () => {
  it("offers one option per kind, labelled in pt-BR", () => {
    const { result } = renderHook(() =>
      useKindToggle({ value: "fixed", onChange: jest.fn() }),
    );

    expect(result.current.options.map((option) => option.label)).toEqual([
      "Fixa",
      "Compromisso futuro",
    ]);
  });

  it("checks the selected kind and only that one", () => {
    const { result } = renderHook(() =>
      useKindToggle({ value: "commitment", onChange: jest.fn() }),
    );

    expect(result.current.options.map((option) => option.checked)).toEqual([
      false,
      true,
    ]);
  });

  it("groups both options under one radio name", () => {
    const { result } = renderHook(() =>
      useKindToggle({ value: "fixed", onChange: jest.fn() }),
    );

    expect(result.current.name).toBe("forecast-kind");
  });

  it("reports the kind an option stands for", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useKindToggle({ value: "fixed", onChange }),
    );

    result.current.options[1].select();

    expect(onChange).toHaveBeenCalledWith("commitment");
  });
});
