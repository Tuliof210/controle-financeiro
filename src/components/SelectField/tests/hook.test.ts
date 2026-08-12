import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useSelectField } from "@/components/SelectField/hook.ts";

const props = {
  id: "dono",
  label: "Dono",
  value: "p1",
  options: [{ value: "p1", label: "Ana" }],
  onChange: jest.fn(),
};

describe("useSelectField", () => {
  it("passes the presentational props through untouched", () => {
    const { result } = renderHook(() => useSelectField(props));

    expect(result.current).toMatchObject({
      id: "dono",
      label: "Dono",
      value: "p1",
      options: props.options,
    });
  });

  it("reports the picked value rather than the event", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useSelectField({ ...props, onChange }));

    result.current.onChange({
      target: { value: "p2" },
    } as React.ChangeEvent<HTMLSelectElement>);

    expect(onChange).toHaveBeenCalledWith("p2");
  });
});
