import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { useDashboardScreen } from "@/app/_components/DashboardScreen/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));

const mount = async () => {
  const rendered = renderHook(() => useDashboardScreen());
  await waitFor(() => expect(rendered.result.current.loading).toBe(false));
  return rendered;
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
  jest.mocked(apiGet).mockResolvedValue({
    data: { status: "no_range" },
  } as never);
});

describe("useDashboardScreen cap persistence", () => {
  it("seeds Meta when a goal is saved and nothing is stored", async () => {
    jest.mocked(apiGet).mockResolvedValue({
      data: { status: "ok", meta: 700 },
    } as never);

    const { result } = await mount();

    await waitFor(() => expect(result.current.cap).toBe("meta"));
    expect(apiGet).toHaveBeenCalledWith(
      "/api/dashboard?owner=familia&cap=meta&simulation=real",
    );
  });

  it("restores the remembered cap across a reload", async () => {
    localStorage.setItem("ceiling-cap", "75");

    const { result } = await mount();

    await waitFor(() => expect(result.current.cap).toBe("75"));
    expect(apiGet).toHaveBeenCalledWith(
      "/api/dashboard?owner=familia&cap=75&simulation=real",
    );
  });

  it("does not send meta when storage says meta but there is no goal", async () => {
    localStorage.setItem("ceiling-cap", "meta");

    const { result } = await mount();

    await waitFor(() => expect(result.current.cap).toBe("50"));
    expect(apiGet).not.toHaveBeenCalledWith(
      expect.stringContaining("cap=meta"),
    );
  });
});
