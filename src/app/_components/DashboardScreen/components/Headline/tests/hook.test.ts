import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useHeadline } from "@/app/_components/DashboardScreen/components/Headline/hook.ts";

describe("useHeadline", () => {
  it("hands the caption, tone and figure straight back", () => {
    const props = {
      caption: "Saldo",
      tone: "positive" as const,
      children: "R$ 1,00",
    };
    const { result } = renderHook(() => useHeadline(props));

    expect(result.current).toEqual(props);
  });

  it("leaves the tone undefined when the card has none", () => {
    const { result } = renderHook(() =>
      useHeadline({ caption: "Teto", children: null }),
    );

    expect(result.current.tone).toBeUndefined();
  });
});
