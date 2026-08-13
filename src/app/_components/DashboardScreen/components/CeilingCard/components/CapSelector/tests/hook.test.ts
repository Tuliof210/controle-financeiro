import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useCapSelector } from "@/app/_components/DashboardScreen/components/CeilingCard/components/CapSelector/hook.ts";

describe("useCapSelector", () => {
  it("leaves Meta out entirely while no goal is saved", () => {
    const { result } = renderHook(() =>
      useCapSelector({ value: "50", hasMeta: false, onChange: jest.fn() }),
    );

    expect(result.current.segments.map((s) => s.cap)).toEqual([
      "25",
      "50",
      "75",
    ]);
  });

  it("offers Meta by name once there is a goal", () => {
    const { result } = renderHook(() =>
      useCapSelector({ value: "meta", hasMeta: true, onChange: jest.fn() }),
    );

    expect(result.current.segments.at(-1)).toMatchObject({
      cap: "meta",
      label: "Meta",
      checked: true,
    });
  });

  it("labels the percentages with their sign, checking only the active one", () => {
    const { result } = renderHook(() =>
      useCapSelector({ value: "75", hasMeta: false, onChange: jest.fn() }),
    );

    expect(result.current.segments.map((s) => s.label)).toEqual([
      "25%",
      "50%",
      "75%",
    ]);
    expect(result.current.segments.filter((s) => s.checked)).toHaveLength(1);
  });

  it("reports the bare value the API's enum accepts", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useCapSelector({ value: "50", hasMeta: false, onChange }),
    );

    result.current.segments[0].select();

    expect(onChange).toHaveBeenCalledWith("25");
  });
});
