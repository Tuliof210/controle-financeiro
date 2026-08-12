import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useSectionCard } from "@/components/SectionCard/hook.ts";

describe("useSectionCard", () => {
  it("passes the required props through", () => {
    const { result } = renderHook(() =>
      useSectionCard({ title: "Saldo", children: null }),
    );

    expect(result.current).toMatchObject({ title: "Saldo", children: null });
  });

  it("leaves every optional prop undefined when it is not given", () => {
    const { result } = renderHook(() =>
      useSectionCard({ title: "Saldo", children: null }),
    );

    expect(result.current).toMatchObject({
      icon: undefined,
      tone: undefined,
      hint: undefined,
      headerEnd: undefined,
      band: undefined,
    });
  });

  it("carries tone, hint and band through when they are given", () => {
    const { result } = renderHook(() =>
      useSectionCard({
        title: "Teto",
        tone: "positive",
        hint: "Como o teto sai",
        band: "brand",
        children: null,
      }),
    );

    expect(result.current).toMatchObject({
      tone: "positive",
      hint: "Como o teto sai",
      band: "brand",
    });
  });
});
