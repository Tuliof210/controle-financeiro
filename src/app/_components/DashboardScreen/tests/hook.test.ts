import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useDashboardScreen } from "@/app/_components/DashboardScreen/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));
jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn() }));

const payload = { status: "no_range" };

const mount = async () => {
  const rendered = renderHook(() => useDashboardScreen());
  await waitFor(() => expect(rendered.result.current.loading).toBe(false));
  return rendered;
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
  jest.mocked(apiGet).mockResolvedValue({ data: payload } as never);
});

describe("useDashboardScreen", () => {
  it("asks for the active profile on the default cap and view", async () => {
    const { result } = await mount();

    expect(apiGet).toHaveBeenCalledWith(
      "/api/dashboard?owner=familia&cap=50&simulation=real",
    );
    expect(result.current.data).toEqual(payload);
    expect(result.current.cap).toBe("50");
  });

  it("reports a refused load instead of an empty board", async () => {
    jest.mocked(apiGet).mockResolvedValue({ error: "Erro ao carregar" });

    const { result } = await mount();

    expect(result.current.error).toBe("Erro ao carregar");
    expect(result.current.data).toBeNull();
  });

  it("reports a 2xx that carried no payload", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: undefined });

    const { result } = await mount();

    expect(result.current.error).toBe("Erro inesperado");
  });

  it("refetches on a cap change, keeping the board on screen", async () => {
    const { result } = await mount();

    act(() => {
      result.current.setCap("75");
    });

    expect(result.current.refreshing).toBe(true);
    expect(result.current.data).toEqual(payload);
    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith(
        "/api/dashboard?owner=familia&cap=75&simulation=real",
      ),
    );
  });

  it("refetches on a simulation change", async () => {
    const { result } = await mount();

    act(() => {
      result.current.setSimulation("all");
    });

    await waitFor(() =>
      expect(apiGet).toHaveBeenCalledWith(
        "/api/dashboard?owner=familia&cap=50&simulation=all",
      ),
    );
  });
});
