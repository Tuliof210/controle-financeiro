import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useTextField } from "@/components/TextField/hook.ts";

const props = {
  label: "Nome",
  value: "Ana",
  id: "nome",
  onChange: jest.fn(),
};

describe("useTextField", () => {
  it("passes the presentational props through untouched", () => {
    const { result } = renderHook(() => useTextField(props));

    expect(result.current).toMatchObject({
      label: "Nome",
      value: "Ana",
      id: "nome",
    });
  });

  it("reports the typed text rather than the event", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useTextField({ ...props, onChange }));

    result.current.onChange({
      target: { value: "Bia" },
    } as React.ChangeEvent<HTMLInputElement>);

    expect(onChange).toHaveBeenCalledWith("Bia");
  });
});
