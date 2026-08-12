import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useShowAll } from "@/app/_components/DashboardScreen/show-all.hook.ts";

const rows = (count: number) => Array.from({ length: count }, (_, i) => i);

describe("useShowAll", () => {
  it("shows every row and hides the toggle under the cap", () => {
    const { result } = renderHook(() => useShowAll(rows(6)));

    expect(result.current.rows).toHaveLength(6);
    expect(result.current.hidden).toBe(false);
  });

  it("caps the list at eight and offers the toggle past it", () => {
    const { result } = renderHook(() => useShowAll(rows(12)));

    expect(result.current.rows).toHaveLength(8);
    expect(result.current.hidden).toBe(true);
    expect(result.current.label).toBe("Ver todos (12)");
    expect(result.current.all).toBe(false);
  });

  it("expands to the whole list and back", () => {
    const { result } = renderHook(() => useShowAll(rows(12)));

    act(() => {
      result.current.toggle();
    });

    expect(result.current.rows).toHaveLength(12);
    expect(result.current.label).toBe("Mostrar menos");
    expect(result.current.all).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.rows).toHaveLength(8);
  });
});
