import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useRowGrid } from "@/components/RowGrid/hook.ts";

describe("useRowGrid", () => {
  it("hands the children back, the layout being entirely CSS", () => {
    const props = { children: "linha" };
    const { result } = renderHook(() => useRowGrid(props));

    expect(result.current).toBe(props);
  });
});
