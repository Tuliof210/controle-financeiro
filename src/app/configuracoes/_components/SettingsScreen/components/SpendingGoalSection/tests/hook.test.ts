import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSpendingGoalSection } from "@/app/configuracoes/_components/SettingsScreen/components/SpendingGoalSection/hook.ts";
import { apiGet, apiPut } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPut: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockResolvedValue({ data: { monthlyGoalCents: 700 } });
  jest.mocked(apiPut).mockResolvedValue({ data: null });
});

describe("useSpendingGoalSection", () => {
  it("loads the saved goal", async () => {
    const { result } = renderHook(() => useSpendingGoalSection());

    await waitFor(() => expect(result.current.cents).toBe(700));
    expect(result.current.saveLabel).toBe("Salvar");
    expect(result.current.saveVariant).toBe("primary");
  });

  it("reads a never-saved singleton as zero", async () => {
    jest.mocked(apiGet).mockResolvedValue({ data: null });

    const { result } = renderHook(() => useSpendingGoalSection());

    await waitFor(() => expect(apiGet).toHaveBeenCalled());
    expect(result.current.cents).toBe(0);
  });

  it("reports a failed load", async () => {
    jest.mocked(apiGet).mockResolvedValue({ error: "Erro ao carregar" });

    const { result } = renderHook(() => useSpendingGoalSection());

    await waitFor(() => expect(result.current.error).toBe("Erro ao carregar"));
  });

  it("reports the save on the button itself", async () => {
    const { result } = renderHook(() => useSpendingGoalSection());
    await waitFor(() => expect(result.current.cents).toBe(700));

    await act(async () => {
      await result.current.onSave();
    });

    expect(apiPut).toHaveBeenCalledWith("/api/settings", {
      monthlyGoalCents: 700,
    });
    expect(result.current.saveLabel).toBe("Salvo");
    expect(result.current.saveVariant).toBe("success");
  });

  it("stops claiming Salvo the moment the field changes", async () => {
    const { result } = renderHook(() => useSpendingGoalSection());
    await waitFor(() => expect(result.current.cents).toBe(700));
    await act(async () => {
      await result.current.onSave();
    });

    act(() => {
      result.current.onChange(900);
    });

    expect(result.current.cents).toBe(900);
    expect(result.current.saveLabel).toBe("Salvar");
  });

  it("reports a refused save", async () => {
    jest.mocked(apiPut).mockResolvedValue({ error: "Dados inválidos" });
    const { result } = renderHook(() => useSpendingGoalSection());
    await waitFor(() => expect(result.current.cents).toBe(700));

    await act(async () => {
      await result.current.onSave();
    });

    expect(result.current.error).toBe("Dados inválidos");
    expect(result.current.saveLabel).toBe("Salvar");
  });
});
