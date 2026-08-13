import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useTypeToggle } from "@/components/EntryForm/components/TypeToggle/hook.ts";

describe("useTypeToggle", () => {
  it("offers one option per entry type, labelled in pt-BR", () => {
    const { result } = renderHook(() =>
      useTypeToggle({ value: "income", onChange: jest.fn() }),
    );

    expect(result.current.options.map((option) => option.label)).toEqual([
      "Entrada",
      "Saída",
    ]);
  });

  it("checks the selected type and only that one", () => {
    const { result } = renderHook(() =>
      useTypeToggle({ value: "expense", onChange: jest.fn() }),
    );

    expect(result.current.options.map((option) => option.checked)).toEqual([
      false,
      true,
    ]);
  });

  it("groups both options under one radio name", () => {
    const { result } = renderHook(() =>
      useTypeToggle({ value: "income", onChange: jest.fn() }),
    );

    expect(result.current.name).toBe("entry-type");
    expect(result.current.options[0].checked).toBe(true);
  });

  it("reports the type an option stands for", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useTypeToggle({ value: "income", onChange }),
    );

    result.current.options[1].select();

    expect(onChange).toHaveBeenCalledWith("expense");
  });
});
