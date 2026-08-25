import { describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useGoalForm } from "@/app/perfil/_components/SettingsScreen/components/GoalsSection/components/GoalForm/hook.ts";

describe("useGoalForm", () => {
  it("starts empty for a new goal", () => {
    const { result } = renderHook(() =>
      useGoalForm({ initial: undefined, onSubmit: jest.fn() }),
    );

    expect(result.current).toMatchObject({
      name: "",
      targetCents: 0,
      canSubmit: false,
    });
  });

  it("seeds from the goal being edited", () => {
    const { result } = renderHook(() =>
      useGoalForm({
        initial: { name: "Casa", targetCents: 5000 },
        onSubmit: jest.fn(),
      }),
    );

    expect(result.current).toMatchObject({ name: "Casa", targetCents: 5000 });
  });

  it("refuses a blank name first", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useGoalForm({ initial: undefined, onSubmit }),
    );

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.localError).toBe("Informe um nome");
  });

  it("refuses a target of nothing, and says why", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useGoalForm({ initial: undefined, onSubmit }),
    );

    act(() => {
      result.current.setName("Casa");
    });
    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.localError).toBe("Informe um valor maior que zero");
  });

  it("submits the name and target once the target is real", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() =>
      useGoalForm({ initial: undefined, onSubmit }),
    );

    act(() => {
      result.current.setName("Casa");
      result.current.setTargetCents(5000);
    });
    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: "Casa", targetCents: 5000 });
    expect(result.current.localError).toBeUndefined();
  });
});
