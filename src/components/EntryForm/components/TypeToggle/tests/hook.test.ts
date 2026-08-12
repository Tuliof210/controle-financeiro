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

  it("accents the selected type and quiets the rest", () => {
    const { result } = renderHook(() =>
      useTypeToggle({ value: "expense", onChange: jest.fn() }),
    );

    expect(result.current.options.map((option) => option.variant)).toEqual([
      "ghost",
      "danger",
    ]);
  });

  it("accents an income selection with the success variant", () => {
    const { result } = renderHook(() =>
      useTypeToggle({ value: "income", onChange: jest.fn() }),
    );

    expect(result.current.options[0].variant).toBe("success");
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
