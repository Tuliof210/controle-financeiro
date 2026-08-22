import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
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

describe("useField money reformat", () => {
  it("re-pins the caret after a reformat while the field has focus", () => {
    const { view, input } = mount(100);
    input.focus();
    input.setSelectionRange(0, 0);

    view.rerender(createElement(Host, { value: 123_456 }));

    expect(input.selectionStart).toBe(input.value.length);
  });

  it("leaves the caret alone while the field is not focused", () => {
    const { view, input } = mount(100);
    input.blur();
    const pin = jest.spyOn(input, "setSelectionRange");

    view.rerender(createElement(Host, { value: 123_456 }));

    expect(pin).not.toHaveBeenCalled();
  });
});
