import { describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useHeader } from "@/components/AppShell/components/Header/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

const props = { sidebarExpanded: true, onToggleSidebar: jest.fn() };

const YEAR = /\d{4}$/;

describe("useHeader", () => {
  it("greets the active profile by name once the clock is read", async () => {
    jest.mocked(useProfile).mockReturnValue({
      label: "Ana",
      profile: "p1",
      people: [{ id: "p1", name: "Ana", color: "violet" }],
      setProfile: jest.fn(),
    } as never);

    const { result } = renderHook(() => useHeader(props));

    await waitFor(() => expect(result.current.greeting).toContain("Ana"));
    expect(result.current.today).toMatch(YEAR);
    expect(result.current.avatarName).toBe("Ana");
    expect(result.current.avatarColor).toBe("var(--cat-violet)");
  });

  it("passes the sidebar state and its toggle through", () => {
    jest.mocked(useProfile).mockReturnValue({
      label: "Família",
      profile: "familia",
      people: [],
      setProfile: jest.fn(),
    } as never);

    const { result } = renderHook(() => useHeader(props));

    expect(result.current).toMatchObject({
      sidebarExpanded: true,
      onToggleSidebar: props.onToggleSidebar,
    });
  });
});
