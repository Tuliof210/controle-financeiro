import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useLoadingCard } from "@/app/leitor-ofx/_components/OfxScreen/components/LoadingCard/hook.ts";

describe("useLoadingCard", () => {
  it("names the file and offers the five skeleton widths", () => {
    const { result } = renderHook(() =>
      useLoadingCard({ fileName: "extrato.ofx" }),
    );

    expect(result.current.fileName).toBe("extrato.ofx");
    expect(result.current.widths).toEqual([92, 78, 85, 64, 71]);
  });
});
