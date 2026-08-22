import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useSelect } from "@/components/Select/hook.ts";

const props = {
  id: "dono",
  label: "Dono",
  value: "p1",
  options: [{ value: "p1", label: "Ana" }],
  onChange: jest.fn<(value: string) => void>(),
};

describe("useSelect", () => {
  it("passes the presentational props through untouched", () => {
    const { result } = renderHook(() => useSelect(props));

    expect(result.current).toMatchObject({
      id: "dono",
      label: "Dono",
      value: "p1",
      options: props.options,
    });
  });

  it("reports the picked value rather than the event", () => {
    const onChange = jest.fn<(value: string) => void>();
    const { result } = renderHook(() => useSelect({ ...props, onChange }));

    result.current.onChange({
      target: { value: "p2" },
    } as React.ChangeEvent<HTMLSelectElement>);

    expect(onChange).toHaveBeenCalledWith("p2");
  });
});
