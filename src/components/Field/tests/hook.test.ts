import { describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useField } from "@/components/Field/hook.ts";

const text = {
  label: "Nome",
  value: "Ana",
  id: "nome",
  onChange: jest.fn<(value: string) => void>(),
};

const REAIS = 123_456;

describe("useField", () => {
  it("passes the presentational props through untouched", () => {
    const { result } = renderHook(() => useField(text));

    expect(result.current).toMatchObject({
      label: "Nome",
      display: "Ana",
      id: "nome",
    });
  });

  it("reports the typed text rather than the event", () => {
    const onChange = jest.fn<(value: string) => void>();
    const { result } = renderHook(() => useField({ ...text, onChange }));

    result.current.onChange({
      target: { value: "Bia" },
    } as React.ChangeEvent<HTMLInputElement>);

    expect(onChange).toHaveBeenCalledWith("Bia");
  });

  it("formats money and reports digits as cents", () => {
    const onChange = jest.fn<(value: number) => void>();
    const { result } = renderHook(() =>
      useField({
        money: true,
        id: "valor",
        label: "Valor",
        value: REAIS,
        onChange,
      }),
    );

    expect(result.current.display).toBe("1234,56");

    act(() => {
      result.current.onChange({
        target: { value: "1.234,56" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(onChange).toHaveBeenCalledWith(REAIS);
  });
});
