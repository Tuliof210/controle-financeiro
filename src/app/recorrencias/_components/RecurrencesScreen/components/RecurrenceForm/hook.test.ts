import { describe, expect, it, vi } from "vitest";
import { currentYYYYMM } from "@/lib/months";
import { PEOPLE, renderHook, withProfile } from "@/lib/render-hook.helper";
import { type RecurrenceFormProps, useRecurrenceForm } from "./hook";

const form = (
  over: Partial<
    Pick<RecurrenceFormProps, "initial" | "people" | "onSubmit">
  > = {},
) =>
  renderHook(
    () =>
      useRecurrenceForm({
        initial: undefined,
        people: PEOPLE,
        onSubmit: vi.fn(),
        ...over,
      }),
    withProfile,
  );

describe("useRecurrenceForm", () => {
  it("seeds a single current-month interval with no initial months", () => {
    const { intervals } = form();
    expect(intervals).toHaveLength(1);
    expect(intervals[0]).toMatchObject({
      start: currentYYYYMM(),
      end: currentYYYYMM(),
    });
  });

  it("blocks submit while the entry is incomplete", () => {
    expect(form().canSubmit).toBe(false);
  });

  it("allows submit once the entry is filled and a month is selected", () => {
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

  it("submits the entry base plus the selected months once valid", () => {
    const onSubmit = vi.fn();
    const { handleSubmit } = form({
      initial: {
        name: "Salario",
        valueCents: 500000,
        months: [202601, 202602],
      },
      onSubmit,
    });
    handleSubmit();
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Salario",
      valueCents: 500000,
      type: "income",
      ownerId: "p1",
      months: [202601, 202602],
    });
  });
});
