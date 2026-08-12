import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useGoalsSection } from "@/app/configuracoes/_components/SettingsScreen/components/GoalsSection/hook.ts";
import type { Goal } from "@/core/entities/goal.entity.ts";
import { apiDelete, apiGet, apiPut } from "@/lib/api.ts";

jest.mock("../../../../../../../lib/api.ts", () => ({
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
  jest.mocked(apiPut).mockResolvedValue({ data: null });
  jest.mocked(apiDelete).mockResolvedValue({ data: null });
});

describe("useGoalsSection update and delete", () => {
  it("puts the edited goal's id alongside the values", async () => {
    const { result } = await mount();

    act(() => {
      result.current.openEdit(goal);
    });
    await act(async () => {
      await result.current.onUpdate(values);
    });

    expect(apiPut).toHaveBeenCalledWith("/api/goals", {
      id: "g1",
      ...values,
    });
  });

  it("ignores an update while nothing is being edited", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.onUpdate(values);
    });

    expect(apiPut).not.toHaveBeenCalled();
  });

  it("deletes by id, and only while a delete is pending", async () => {
    const { result } = await mount();

    await act(async () => {
      await result.current.onConfirmDelete();
    });
    expect(apiDelete).not.toHaveBeenCalled();

    act(() => {
      result.current.openDelete(goal);
    });
    await act(async () => {
      await result.current.onConfirmDelete();
    });

    expect(apiDelete).toHaveBeenCalledWith("/api/goals?id=g1");
  });
});
