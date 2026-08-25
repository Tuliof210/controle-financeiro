import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePreferences } from "@/app/perfil/_components/SettingsScreen/preferences.hook.ts";
import { apiPut } from "@/lib/api.ts";
import { mockLoad, STORED } from "./preferences.fixture.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn(), apiPut: jest.fn() }));

// Split off preferences.hook.test.ts for the 100-line cap. This half covers the
// single Salvar: what reaches the wire, when the button is live, and what the
// live region says.
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
  it("writes the seven fields in one PUT", async () => {
    const result = await loaded();

    act(() => result.current.onSimulatedChange(false));
    await act(async () => {
      await result.current.onSave();
    });

    expect(apiPut).toHaveBeenCalledTimes(1);
    expect(apiPut).toHaveBeenCalledWith("/api/settings", {
      ...STORED,
      showSimulated: false,
    });
    expect(result.current.savedMessage).toBe("Ajustes salvos.");
  });

  it("stays clean until a field moves, and settles again once saved", async () => {
    const result = await loaded();
    expect(result.current.dirty).toBe(false);

    act(() => result.current.onModeChange("goalsMode", "fixed"));
    expect(result.current.dirty).toBe(true);

    await act(async () => {
      await result.current.onSave();
    });
    expect(result.current.dirty).toBe(false);
  });

  it("counts a percentage and an amount as changes too", async () => {
    const result = await loaded();

    act(() => result.current.onPercentChange("goalsPercent", "40"));
    expect(result.current.dirty).toBe(true);

    act(() =>
      result.current.onCentsChange("ceilingCents", STORED.ceilingCents),
    );
    act(() => result.current.onPercentChange("goalsPercent", "30"));
    expect(result.current.dirty).toBe(false);
  });

  it("drops the confirmation the moment a field changes", async () => {
    const result = await loaded();
    await act(async () => {
      await result.current.onSave();
    });
    expect(result.current.savedMessage).toBe("Ajustes salvos.");

    act(() => result.current.onSimulatedChange(false));

    expect(result.current.savedMessage).toBe("");
  });

  it("reports a refused save and keeps the edit pending", async () => {
    jest.mocked(apiPut).mockResolvedValue({ error: "Dados inválidos" });
    const result = await loaded();

    act(() => result.current.onSimulatedChange(false));
    await act(async () => {
      await result.current.onSave();
    });

    expect(result.current.error).toBe("Dados inválidos");
    expect(result.current.savedMessage).toBe("");
    expect(result.current.dirty).toBe(true);
  });
});
