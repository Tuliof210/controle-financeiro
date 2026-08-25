import { beforeEach, describe, expect, it } from "@jest/globals";
import { renderHook, waitFor } from "@testing-library/react";
import { usePreferences } from "@/app/perfil/_components/SettingsScreen/preferences.hook.ts";
import { PREFS_COPY } from "@/app/perfil/_components/SettingsScreen/preferences-copy.ts";
import { apiGet, apiPut } from "@/lib/api.ts";
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
  jest.mocked(apiPut).mockResolvedValue({ data: null });
});

describe("usePreferences load", () => {
  it("seeds the cards from the stored row", async () => {
    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(result.current.settings).toEqual(STORED));
    expect(result.current.preview.maxCents).toBe(HEADROOM);
    expect(result.current.ready).toBe(true);
  });

  it("reads a never-saved singleton as the defaults", async () => {
    jest.mocked(apiGet).mockImplementation((url: string) => {
      if (url.startsWith("/api/settings")) {
        return Promise.resolve({ data: null }) as never;
      }
      return Promise.resolve({ data: emptyDashboard }) as never;
    });

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("has no maximum to announce when there is no period", async () => {
    mockLoad(emptyDashboard);

    const { result } = renderHook(() => usePreferences());

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.preview.kind).toBe("empty");
    expect(result.current.preview.maxCents).toBeNull();
  });

  it("does not bind stored values after a failed settings load", async () => {
    jest
      .mocked(apiGet)
      .mockResolvedValue({ error: "Erro ao carregar" } as never);

    const { result } = renderHook(() => usePreferences());

    await waitFor(() =>
      expect(result.current.error).toBe(PREFS_COPY.loadError),
    );
    expect(result.current.ready).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});
