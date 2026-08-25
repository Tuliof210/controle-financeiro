import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSettingsScreen } from "@/app/perfil/_components/SettingsScreen/hook.ts";
import { apiPut } from "@/lib/api.ts";
import { HEADROOM, MONTHLY, mockLoad, STORED } from "./preferences.fixture.ts";

jest.mock("@/lib/api.ts", () => ({ apiGet: jest.fn(), apiPut: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  mockLoad();
  jest.mocked(apiPut).mockResolvedValue({ data: null });
});

describe("useSettingsScreen", () => {
  it("names the screen in pt-BR", () => {
    const { result } = renderHook(() => useSettingsScreen());

    expect(result.current.header).toEqual({
      title: "Ajustes",
      subtitle: "Pessoas, objetivos e como o dashboard exibe seus números.",
    });
  });

  it("hands each card the field it writes", async () => {
    const { result } = renderHook(() => useSettingsScreen());

    await waitFor(() => expect(result.current.ceiling.cents).toBe(700));
    expect(result.current.ceiling.mode).toBe("fixed");
    expect(result.current.ceiling.maxCents).toBe(HEADROOM);
    expect(result.current.goalsLimit.percent).toBe(30);
    expect(result.current.goalsLimit.maxCents).toBe(MONTHLY);
    expect(result.current.simulated.value).toBe(true);
  });

  it("routes a card's edit to its own field, not its neighbour's", async () => {
    const { result } = renderHook(() => useSettingsScreen());
    await waitFor(() => expect(result.current.ceiling.cents).toBe(700));

    act(() => {
      result.current.goalsLimit.onPercentChange("40");
    });

    expect(result.current.goalsLimit.percent).toBe(40);
    expect(result.current.ceiling.percent).toBe(STORED.ceilingPercent);
  });
});
