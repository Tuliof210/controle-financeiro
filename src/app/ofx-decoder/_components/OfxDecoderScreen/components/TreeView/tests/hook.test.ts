import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useTreeView } from "@/app/ofx-decoder/_components/OfxDecoderScreen/components/TreeView/hook.ts";

describe("useTreeView", () => {
  it("hands its props straight back", () => {
    const props = {
      fileName: "extrato.ofx",
      header: [],
      root: { id: 0, tag: "OFX", children: [] },
      onClose: jest.fn(),
      onFile: jest.fn(),
    };
    const { result } = renderHook(() => useTreeView(props));

    expect(result.current).toBe(props);
  });
});
