import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useGoalsSection } from "@/app/perfil/_components/SettingsScreen/components/GoalsSection/hook.ts";
import type { Goal } from "@/core/entities/goal.entity.ts";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api.ts";

jest.mock("@/lib/api.ts", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

const goal = { id: "g1", name: "Casa", targetCents: 5000 } as Goal;
const values = { name: "Casa", targetCents: 5000 };

const mount = async () => {
  const rendered = renderHook(() => useGoalsSection());
  await waitFor(() => expect(rendered.result.current.goals).toEqual([goal]));
  return rendered;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(apiGet).mockResolvedValue({ data: [goal] } as never);
  jest.mocked(apiPost).mockResolvedValue({ data: null });
  jest.mocked(apiPut).mockResolvedValue({ data: null });
  jest.mocked(apiDelete).mockResolvedValue({ data: null });
});

describe("useGoalsSection", () => {
  it("lists the goals on mount", async () => {
    const { result } = await mount();

    expect(result.current.modal).toEqual({ type: "none" });
  });

  it("reports a failed list", async () => {
    jest.mocked(apiGet).mockResolvedValue({ error: "Erro ao carregar" });

    const { result } = renderHook(() => useGoalsSection());

    await waitFor(() => expect(result.current.error).toBe("Erro ao carregar"));
  });

  it("opens each modal on its own goal, then closes", async () => {
    const { result } = await mount();

    act(() => {
      result.current.openAdd();
    });
    expect(result.current.modal).toEqual({ type: "add" });

    act(() => {
      result.current.openEdit(goal);
    });
    expect(result.current.modal).toEqual({ type: "edit", goal });

    act(() => {
      result.current.openDelete(goal);
    });
    expect(result.current.modal).toEqual({ type: "delete", goal });

    act(() => {
      result.current.close();
    });
    expect(result.current.modal).toEqual({ type: "none" });
  });

  it("posts a new goal", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.onAdd(values);
    });

    expect(apiPost).toHaveBeenCalledWith("/api/goals", values);
  });

  it("keeps the modal open and reports a refused write", async () => {
    jest.mocked(apiPost).mockResolvedValue({ error: "Dados inválidos" });
    const { result } = await mount();

    act(() => {
      result.current.openAdd();
    });
    await act(async () => {
      await result.current.onAdd(values);
    });

    expect(result.current.error).toBe("Dados inválidos");
    expect(result.current.modal).toEqual({ type: "add" });
  });
});
