import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePreferences } from "@/app/perfil/_components/SettingsScreen/preferences.hook.ts";
import { apiPut } from "@/lib/api.ts";
import { MAX_CENTS } from "@/lib/money.ts";
import {
  emptyDashboard,
  HEADROOM,
  MONTHLY,
  mockLoad,
  STORED,
} from "./preferences.fixture.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn(), apiPut: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  mockLoad();
  jest.mocked(apiPut).mockResolvedValue({ data: null });
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
    await waitFor(() => expect(result.current.preview.maxCents).toBe(HEADROOM));

    act(() => result.current.onCentsChange("ceilingCents", HEADROOM + 1));

    expect(result.current.settings.ceilingCents).toBe(HEADROOM);
  });

  it("saturates a fixed goals amount at this month's teto", async () => {
    const { result } = renderHook(() => usePreferences());
    await waitFor(() =>
      expect(result.current.preview.monthlyCents).toBe(MONTHLY),
    );

    act(() => result.current.onCentsChange("goalsCents", MONTHLY + 1));

    expect(result.current.settings.goalsCents).toBe(MONTHLY);
  });

  it("falls back to the money guard when there is no headroom", async () => {
    mockLoad(emptyDashboard);
    const { result } = renderHook(() => usePreferences());
    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => result.current.onCentsChange("goalsCents", MAX_CENTS + 1));

    expect(result.current.settings.goalsCents).toBe(MAX_CENTS);
  });
});
