import { describe, expect, it, jest } from "@jest/globals";
import { act, render, renderHook, screen } from "@testing-library/react";
import { createElement } from "react";
import { useField } from "@/components/Field/hook.ts";

function Host({ value }: { value: number }) {
  const { display, inputRef, onFocus, onSelect } = useField({
    money: true,
    id: "valor",
    label: "Valor",
    value,
    onChange: jest.fn<(value: number) => void>(),
  });

  return createElement("input", {
    "data-testid": "money",
    ref: inputRef,
    value: display,
    readOnly: true,
    onFocus,
    onSelect,
  });
}

const mount = (value = 123_456) => {
  const view = render(createElement(Host, { value }));
  return { view, input: screen.getByTestId("money") as HTMLInputElement };
};

const caretAt = (input: HTMLInputElement, at: number) => {
  input.setSelectionRange(at, at);
};

const stubInput = (selectionStart: number, selectionEnd: number) =>
  ({
    value: "1234,56",
    selectionStart,
    selectionEnd,
    setSelectionRange: jest.fn(),
  }) as unknown as HTMLInputElement & { setSelectionRange: jest.Mock };

const handlerOf = () =>
  renderHook(() =>
    useField({
      money: true,
      id: "valor",
      label: "Valor",
      value: 123_456,
      onChange: jest.fn<(value: number) => void>(),
    }),
  ).result.current;

describe("useField money caret", () => {
  it("drops the caret at the end on focus", () => {
    const { input } = mount();
    caretAt(input, 0);

    act(() => {
      input.focus();
    });

    expect(input.selectionStart).toBe(input.value.length);
  });

  it("pins a collapsed caret sitting mid-field back to the end", () => {
    const el = stubInput(2, 2);

    handlerOf().onSelect({ currentTarget: el } as never);

    expect(el.setSelectionRange).toHaveBeenCalledWith(7, 7);
  });

  it("leaves a range selection alone, so select-all can clear the field", () => {
    const el = stubInput(0, 7);

    handlerOf().onSelect({ currentTarget: el } as never);

    expect(el.setSelectionRange).not.toHaveBeenCalled();
  });

  it("does nothing when the caret is already at the end", () => {
    const el = stubInput(7, 7);

    handlerOf().onSelect({ currentTarget: el } as never);

    expect(el.setSelectionRange).not.toHaveBeenCalled();
  });
});
