import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useProfileSelect } from "@/components/AppShell/components/Header/components/ProfileSelect/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

const people = [{ id: "p1", name: "Ana" }];

describe("useProfileSelect", () => {
  it("exposes the active profile and the people to pick from", () => {
    jest.mocked(useProfile).mockReturnValue({
      profile: "p1",
      people,
      setProfile: jest.fn(),
    } as never);

    const { result } = renderHook(() => useProfileSelect());

    expect(result.current).toMatchObject({ profile: "p1", people });
  });

  it("switches the profile to the value that was picked", () => {
    const setProfile = jest.fn();
    jest
      .mocked(useProfile)
      .mockReturnValue({ profile: "familia", people, setProfile } as never);

    const { result } = renderHook(() => useProfileSelect());
    result.current.onChange({
      target: { value: "p1" },
    } as React.ChangeEvent<HTMLSelectElement>);

    expect(setProfile).toHaveBeenCalledWith("p1");
  });
});
