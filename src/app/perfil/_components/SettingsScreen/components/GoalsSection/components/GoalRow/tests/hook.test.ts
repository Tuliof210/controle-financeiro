import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useGoalRow } from "@/app/perfil/_components/SettingsScreen/components/GoalsSection/components/GoalRow/hook.ts";
import type { Goal } from "@/core/entities/goal.entity.ts";

const goal = { id: "g1", name: "Casa", targetCents: 150_000 } as Goal;

describe("useGoalRow", () => {
  it("formats the target as money", () => {
    const { result } = renderHook(() =>
      useGoalRow({ goal, onEdit: jest.fn(), onDelete: jest.fn() }),
    );

    expect(result.current).toMatchObject({
      name: "Casa",
      value: "R$ 1.500,00",
    });
  });

  it("binds both actions to its own goal", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { result } = renderHook(() => useGoalRow({ goal, onEdit, onDelete }));

    result.current.onEdit();
    result.current.onDelete();

    expect(onEdit).toHaveBeenCalledWith(goal);
    expect(onDelete).toHaveBeenCalledWith(goal);
  });
});
