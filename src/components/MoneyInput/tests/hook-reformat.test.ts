import { describe, expect, it, jest } from "@jest/globals";
import { act, render, renderHook, screen } from "@testing-library/react";
import { createElement } from "react";
import { useMoneyInput } from "@/components/MoneyInput/hook.ts";

// The caret rules are the whole point of this hook and they only exist against
// a real, focused <input> — so it runs inside the smallest host that can give
// it one. createElement, not JSX: this stays the `.ts` sibling of `hook.ts`.
function Host({ valueCents }: { valueCents: number }) {
  const { display, inputRef, onFocus, onSelect } = useMoneyInput({
    valueCents,
    onChange: jest.fn(),
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

const mount = (valueCents = 123_456) => {
  const view = render(createElement(Host, { valueCents }));
  return { view, input: screen.getByTestId("money") as HTMLInputElement };
};

const caretAt = (input: HTMLInputElement, at: number) => {
  input.setSelectionRange(at, at);
};

const _stubInput = (selectionStart: number, selectionEnd: number) =>
  ({
    value: "1234,56",
    selectionStart,
    selectionEnd,
    setSelectionRange: jest.fn(),
  }) as unknown as HTMLInputElement & { setSelectionRange: jest.Mock };

const _handlerOf = () =>
  renderHook(() => useMoneyInput({ valueCents: 123_456, onChange: jest.fn() }))
    .result.current;

describe("useMoneyInput on reformat", () => {
  it("re-pins the caret after a reformat while the field has focus", () => {
    const { view, input } = mount(100);
    act(() => {
      input.focus();
      caretAt(input, 0);
    });

    view.rerender(createElement(Host, { valueCents: 123_456 }));

    expect(input.selectionStart).toBe(input.value.length);
  });

  // Asserted on the call, not on selectionStart: jsdom moves the caret to the
  // end by itself whenever an input's value changes, which would read as a pin
  // the hook never performed.
  it("leaves the caret alone while the field is not focused", () => {
    const { view, input } = mount(100);
    input.blur();
    const pin = jest.spyOn(input, "setSelectionRange");

    view.rerender(createElement(Host, { valueCents: 123_456 }));

    expect(pin).not.toHaveBeenCalled();
  });
});
