import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePreferences } from "@/app/perfil/_components/SettingsScreen/preferences.hook.ts";
import { PREFS_COPY } from "@/app/perfil/_components/SettingsScreen/preferences-copy.ts";
import { apiPut } from "@/lib/api.ts";
import { mockLoad, STORED } from "./preferences.fixture.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn(), apiPut: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  mockLoad();
  jest.mocked(apiPut).mockResolvedValue({ data: null });
});

const loaded = async () => {
  const { result } = renderHook(() => usePreferences());
  await waitFor(() => expect(result.current.settings).toEqual(STORED));
  return result;
};

describe("usePreferences save", () => {
  it("writes the seven fields as soon as a control moves", async () => {
    const result = await loaded();

    act(() => {
      result.current.onSimulatedChange(false);
    });

    await waitFor(() => expect(apiPut).toHaveBeenCalledTimes(1));
    expect(apiPut).toHaveBeenCalledWith("/api/settings", {
      ...STORED,
      showSimulated: false,
    });
    await waitFor(() =>
      expect(result.current.statusMessage).toBe(PREFS_COPY.saved),
    );
  });

  it("settles clean again once the PUT lands", async () => {
    const result = await loaded();

    act(() => {
      result.current.onModeChange("goalsMode", "fixed");
    });
    await waitFor(() =>
      expect(result.current.statusMessage).toBe(PREFS_COPY.saved),
    );
    expect(result.current.saving).toBe(false);
  });

  it("drops the confirmation the moment a field changes", async () => {
    const result = await loaded();
    act(() => {
      result.current.onSimulatedChange(false);
    });
    await waitFor(() =>
      expect(result.current.statusMessage).toBe(PREFS_COPY.saved),
    );

    act(() => result.current.onSimulatedChange(true));

    expect(result.current.statusMessage).not.toBe(PREFS_COPY.saved);
  });

  it("reports a refused save and keeps the edit on screen", async () => {
    jest.mocked(apiPut).mockResolvedValue({ error: "Dados inválidos" });
    const result = await loaded();

    act(() => {
      result.current.onSimulatedChange(false);
    });

    await waitFor(() =>
      expect(result.current.error).toBe(PREFS_COPY.saveError),
    );
    expect(result.current.statusMessage).toBe("");
    expect(result.current.settings.showSimulated).toBe(false);
  });
});
