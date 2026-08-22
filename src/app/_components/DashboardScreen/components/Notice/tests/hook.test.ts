import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useNotice } from "@/app/_components/DashboardScreen/components/Notice/hook.ts";

describe("useNotice", () => {
  it("hands the title, icon and body straight back", () => {
    const props = {
      title: "Período global",
      icon: "calendar" as const,
      children: "x",
    };
    const { result } = renderHook(() => useNotice(props));

    expect(result.current).toEqual(props);
  });
});
