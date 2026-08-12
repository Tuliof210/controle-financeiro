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

const stubInput = (selectionStart: number, selectionEnd: number) =>
  ({
    value: "1234,56",
    selectionStart,
    selectionEnd,
    setSelectionRange: jest.fn(),
  }) as unknown as HTMLInputElement & { setSelectionRange: jest.Mock };

const handlerOf = () =>
  renderHook(() => useMoneyInput({ valueCents: 123_456, onChange: jest.fn() }))
    .result.current;

describe("useMoneyInput caret", () => {
  it("drops the caret at the end on focus", () => {
    const { input } = mount();
    caretAt(input, 0);

    act(() => {
      input.focus();
    });

    expect(input.selectionStart).toBe(input.value.length);
  });

  // The two selection guards go through the handler directly: React's onSelect
  // is synthesised from several DOM events, so firing one is not a faithful way
  // to state "the caret sits mid-field".
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
