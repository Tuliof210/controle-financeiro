import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useColorPicker } from "@/components/ColorPicker/hook.ts";
import { PALETTE } from "@/lib/palette.ts";

describe("useColorPicker", () => {
  it("offers one swatch per palette colour", () => {
    const { result } = renderHook(() =>
      useColorPicker({ value: "violet", onChange: jest.fn() }),
    );

    expect(result.current.swatches.map((s) => s.key)).toEqual([...PALETTE]);
  });

  it("marks exactly the active colour as selected", () => {
    const { result } = renderHook(() =>
      useColorPicker({ value: "lime", onChange: jest.fn() }),
    );

    const selected = result.current.swatches.filter((s) => s.selected);

    expect(selected).toHaveLength(1);
    expect(selected[0].key).toBe("lime");
  });

  it("reports the colour a swatch stands for", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useColorPicker({ value: "violet", onChange }),
    );

    result.current.swatches[1].select();

    expect(onChange).toHaveBeenCalledWith(PALETTE[1]);
  });
});
