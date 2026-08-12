import { describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useHeader } from "@/components/AppShell/components/Header/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";

jest.mock("../../../../ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

const props = { sidebarExpanded: true, onToggleSidebar: jest.fn() };

const YEAR = /\d{4}$/;

describe("useHeader", () => {
  it("greets the active profile by name once the clock is read", async () => {
    jest.mocked(useProfile).mockReturnValue({ label: "Ana" } as never);

    const { result } = renderHook(() => useHeader(props));

    await waitFor(() => expect(result.current.greeting).toContain("Ana"));
    expect(result.current.today).toMatch(YEAR);
  });

  it("passes the sidebar state and its toggle through", () => {
    jest.mocked(useProfile).mockReturnValue({ label: "Família" } as never);

    const { result } = renderHook(() => useHeader(props));

    expect(result.current).toMatchObject({
      sidebarExpanded: true,
      onToggleSidebar: props.onToggleSidebar,
    });
  });
});
