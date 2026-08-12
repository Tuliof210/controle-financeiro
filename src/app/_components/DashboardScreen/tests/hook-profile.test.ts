import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardScreen } from "@/app/_components/DashboardScreen/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("../../../../components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("../../../../lib/api.ts", () => ({ apiGet: jest.fn() }));

const payload = { status: "no_range" };

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
  jest.mocked(apiGet).mockResolvedValue({ data: payload } as never);
});

describe("useDashboardScreen on a profile switch", () => {
  it("drops the held board rather than showing it under another name", async () => {
    const { result, rerender } = renderHook(() => useDashboardScreen());
    await waitFor(() => expect(result.current.data).toEqual(payload));

    jest.mocked(useProfile).mockReturnValue({ profile: "p1" } as never);
    rerender();

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it("escapes the owner it puts on the wire", async () => {
    jest.mocked(useProfile).mockReturnValue({ profile: "a b" } as never);

    renderHook(() => useDashboardScreen());

    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith(
        "/api/dashboard?owner=a%20b&cap=50&simulation=real",
      ),
    );
  });
});
