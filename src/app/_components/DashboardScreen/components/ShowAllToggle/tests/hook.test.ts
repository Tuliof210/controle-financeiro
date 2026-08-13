import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useShowAllToggle } from "@/app/_components/DashboardScreen/components/ShowAllToggle/hook.ts";

describe("useShowAllToggle", () => {
  it("hands the label, the disclosure state, the target and the action back", () => {
    const props = {
      label: "Ver todos (12)",
      expanded: false,
      controls: "ceiling-months",
      onClick: jest.fn(),
    };
    const { result } = renderHook(() => useShowAllToggle(props));

    expect(result.current).toEqual(props);
  });
});
