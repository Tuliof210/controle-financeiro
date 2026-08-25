import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePreferences } from "@/app/perfil/_components/SettingsScreen/preferences.hook.ts";
import { apiGet } from "@/lib/api.ts";
import { MAX_CENTS } from "@/lib/money.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";
import {
  emptyDashboard,
  HEADROOM,
  mockLoad,
  STORED,
} from "./preferences.fixture.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn(), apiPut: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  mockLoad();
});

describe("usePreferences load", () => {
  it("seeds the cards from the stored row", async () => {
    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(result.current.settings).toEqual(STORED));
    expect(result.current.maxCents).toBe(HEADROOM);
    expect(result.current.dirty).toBe(false);
  });

  it("reads a never-saved singleton as the defaults", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: null } as never);

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(apiGet).toHaveBeenCalled());
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("has no maximum to announce when there is no period", async () => {
    mockLoad(emptyDashboard);

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(result.current.settings).toEqual(STORED));
    expect(result.current.maxCents).toBeNull();
  });

  it("reports a failed settings load", async () => {
    jest
      .mocked(apiGet)
      .mockResolvedValue({ error: "Erro ao carregar" } as never);

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(result.current.error).toBe("Erro ao carregar"));
  });
});

describe("usePreferences clamps", () => {
  it("saturates a percentage at one hundred", async () => {
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.settings).toEqual(STORED));

    act(() => result.current.onPercentChange("ceilingPercent", "250"));

    expect(result.current.settings.ceilingPercent).toBe(100);
  });

  it("saturates a fixed amount at the headroom", async () => {
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.maxCents).toBe(HEADROOM));

    act(() => result.current.onCentsChange("ceilingCents", HEADROOM + 1));

    expect(result.current.settings.ceilingCents).toBe(HEADROOM);
  });

  it("falls back to the money guard when there is no headroom", async () => {
    mockLoad(emptyDashboard);
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.settings).toEqual(STORED));

    act(() => result.current.onCentsChange("goalsCents", MAX_CENTS + 1));

    expect(result.current.settings.goalsCents).toBe(MAX_CENTS);
  });
});
