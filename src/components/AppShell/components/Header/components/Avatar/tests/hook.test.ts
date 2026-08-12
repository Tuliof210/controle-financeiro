import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useAvatar } from "@/components/AppShell/components/Header/components/Avatar/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";

jest.mock("../../../../../../ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

describe("useAvatar", () => {
  it("initialises the active profile's label", () => {
    jest.mocked(useProfile).mockReturnValue({ label: "Ana Silva" } as never);

    const { result } = renderHook(() => useAvatar());

    expect(result.current.initials).toBe("AS");
  });
});
