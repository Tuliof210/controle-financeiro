import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSpendingGoalSection } from "@/app/perfil/_components/SettingsScreen/components/SpendingGoalSection/hook.ts";
import { apiGet, apiPut } from "@/lib/api.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPut: jest.fn(),
}));

// Split off hook.test.ts for the 100-line cap. This half covers only what the
// card puts on the wire: /api/settings has no PATCH, so a card editing one
// field has to hand the other six back exactly as they arrived.
const saved = {
  ...DEFAULT_SETTINGS,
  ceilingCents: 700,
  goalsMode: "fixed" as const,
  goalsCents: 5000,
  showSimulated: true,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockResolvedValue({ data: saved });
  jest.mocked(apiPut).mockResolvedValue({ data: null });
});

describe("useSpendingGoalSection payload", () => {
  it("hands the loaded object straight back when nothing was edited", async () => {
    const { result } = renderHook(() => useSpendingGoalSection());
    await waitFor(() => expect(result.current.cents).toBe(700));

    await act(async () => {
      await result.current.onSave();
    });

    expect(apiPut).toHaveBeenCalledWith("/api/settings", saved);
  });

  it("saves the edited amount without disturbing the other six", async () => {
    const { result } = renderHook(() => useSpendingGoalSection());
    await waitFor(() => expect(result.current.cents).toBe(700));

    act(() => {
      result.current.onChange(900);
    });
    await act(async () => {
      await result.current.onSave();
    });

    expect(apiPut).toHaveBeenCalledWith("/api/settings", {
      ...saved,
      ceilingCents: 900,
    });
  });

  it("falls back to DEFAULT_SETTINGS when nothing was ever saved", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: null });
    const { result } = renderHook(() => useSpendingGoalSection());
    await waitFor(() => expect(apiGet).toHaveBeenCalled());

    await act(async () => {
      await result.current.onSave();
    });

    expect(apiPut).toHaveBeenCalledWith("/api/settings", DEFAULT_SETTINGS);
  });
});
