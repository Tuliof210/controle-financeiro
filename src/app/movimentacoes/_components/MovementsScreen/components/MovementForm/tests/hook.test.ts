import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useMovementForm } from "@/app/movimentacoes/_components/MovementsScreen/components/MovementForm/hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import { currentYyyymm } from "@/lib/months.ts";

jest.mock("@/components/ProfileProvider/hook.ts", () => ({
  useProfile: jest.fn(),
}));

const people = [{ id: "p1", name: "Ana" }] as Person[];

const mount = (initial?: Record<string, unknown>, onSubmit = jest.fn()) =>
  renderHook(() => useMovementForm({ initial, people, onSubmit }));

beforeEach(() => {
  jest.mocked(useProfile).mockReturnValue({ profile: "familia" } as never);
});

describe("useMovementForm", () => {
  it("starts on the current month, the picker needing a value at once", () => {
    const { result } = mount();

    expect(result.current.month).toBe(currentYyyymm());
    expect(result.current.canSubmit).toBe(false);
  });

  it("seeds the month of the movement being edited", () => {
    const { result } = mount({ month: 202_601, name: "Luz", valueCents: 1 });

    expect(result.current.month).toBe(202_601);
    expect(result.current.canSubmit).toBe(true);
  });

  it("refuses to submit an incomplete form, and says why", () => {
    const onSubmit = jest.fn();
    const { result } = mount(undefined, onSubmit);

    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.localError).toBe(
      "Preencha nome, valor e responsável corretamente",
    );
  });

  it("submits the entry base plus the picked month", () => {
    const onSubmit = jest.fn();
    const { result } = mount(
      { name: "Luz", valueCents: 900, type: "expense", ownerId: "p1" },
      onSubmit,
    );

    act(() => {
      result.current.setMonth(202_612);
    });
    act(() => {
      result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Luz",
      valueCents: 900,
      type: "expense",
      ownerId: "p1",
      month: 202_612,
    });
    expect(result.current.localError).toBeUndefined();
  });
});
