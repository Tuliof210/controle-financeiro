import { createElement, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { ProfileContext } from "@/components/ProfileProvider/hook";
import type { Person } from "@/core/entities/person.entity";
import { currentYYYYMM } from "@/lib/months";
import { renderHook } from "@/lib/render-hook.helper";
import { type RecurrenceFormProps, useRecurrenceForm } from "./hook";

const PEOPLE: Person[] = [
  { id: "p1", name: "Marina", color: "cyan", createdAt: new Date() },
];

// useRecurrenceForm calls useEntryForm, which reads useProfile — supply the
// Context value directly so the hook runs without a live ProfileProvider.
const withProfile = (children: ReactElement) =>
  createElement(
    ProfileContext.Provider,
    {
      value: {
        profile: "p1",
        people: PEOPLE,
        label: "Marina",
        setProfile: vi.fn(),
      },
    },
    children,
  );

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
