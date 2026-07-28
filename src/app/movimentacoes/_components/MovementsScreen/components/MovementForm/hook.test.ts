import { describe, expect, it, vi } from "vitest";
import { currentYYYYMM } from "@/lib/months";
import { PEOPLE, renderHook, withProfile } from "@/lib/render-hook.helper";
import { type MovementFormProps, useMovementForm } from "./hook";

const form = (
  over: Partial<
    Pick<MovementFormProps, "initial" | "people" | "onSubmit">
  > = {},
) =>
  renderHook(
    () =>
      useMovementForm({
        initial: undefined,
        people: PEOPLE,
        onSubmit: vi.fn(),
        ...over,
      }),
    withProfile,
  );

describe("useMovementForm", () => {
  it("defaults the month to the current month with no initial value", () => {
    expect(form().month).toBe(currentYYYYMM());
  });

  it("seeds the month from an initial value when given", () => {
    expect(form({ initial: { month: 202603 } }).month).toBe(202603);
  });

  it("blocks submit while the entry is incomplete", () => {
    expect(form().canSubmit).toBe(false);
  });

  it("allows submit once name, value and owner are all filled", () => {
    const { canSubmit } = form({
      initial: { name: "Salario", valueCents: 500000 },
    });
    expect(canSubmit).toBe(true);
  });

  it("blocks handleSubmit and never calls onSubmit while invalid", () => {
    const onSubmit = vi.fn();
    const { handleSubmit } = form({ onSubmit });
    handleSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the entry base plus the chosen month once valid", () => {
    const onSubmit = vi.fn();
    const { handleSubmit } = form({
      initial: { name: "Salario", valueCents: 500000, month: 202603 },
      onSubmit,
    });
    handleSubmit();
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Salario",
      valueCents: 500000,
      type: "income",
      ownerId: "p1",
      month: 202603,
    });
  });
});
