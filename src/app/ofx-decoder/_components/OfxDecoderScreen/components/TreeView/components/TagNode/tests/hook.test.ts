import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useTagNode } from "@/app/ofx-decoder/_components/OfxDecoderScreen/components/TreeView/components/TagNode/hook.ts";

describe("useTagNode", () => {
  it("hands the node straight back", () => {
    const node = { id: 1, tag: "CURDEF", value: "BRL" };
    const { result } = renderHook(() => useTagNode({ node }));

    expect(result.current).toBe(node);
  });
});
