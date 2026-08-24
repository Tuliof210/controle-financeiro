import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useSections } from "@/components/EntryScreen/components/Sections/hook.ts";
import type { EntryScreenLabels } from "@/components/EntryScreen/types.ts";
import type { Entry } from "@/lib/entry-types.ts";

const labels = {
  income: { add: "Nova entrada", emptyTitle: "a", emptyHint: "b" },
  expense: { add: "Nova saída", emptyTitle: "c", emptyHint: "d" },
} as EntryScreenLabels;

const income = [{ id: "e1", type: "income" }] as Entry[];
const expense = [{ id: "e2", type: "expense" }] as Entry[];

const props = {
  labels,
  income,
  expense,
  people: [],
  period: null,
  renderPeriod: () => null,
  onAdd: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("useSections", () => {
  it("builds the two sections, in reading order", () => {
    const { result } = renderHook(() => useSections(props));

    expect(result.current.sections.map((s) => s.key)).toEqual([
      "income",
      "expense",
    ]);
    expect(result.current.sections.map((s) => s.title)).toEqual([
      "Entradas",
      "Saídas",
    ]);
  });

  it("gives each section its own items, tone and copy", () => {
    const { result } = renderHook(() => useSections(props));
    const [first, second] = result.current.sections;

    expect(first).toMatchObject({
      items: income,
      tone: "positive",
      labels: labels.income,
    });
    expect(second).toMatchObject({
      items: expense,
      labels: labels.expense,
    });
    // Red is for a month in the red, not for every outflow.
    expect(second.tone).toBeUndefined();
  });

  it("threads the shared props to both", () => {
    const { result } = renderHook(() => useSections(props));

    for (const section of result.current.sections) {
      expect(section).toMatchObject({
        people: props.people,
        period: null,
        onEdit: props.onEdit,
        onDelete: props.onDelete,
      });
    }
  });

  it("binds each add action to its own type", () => {
    const onAdd = jest.fn();
    const { result } = renderHook(() => useSections({ ...props, onAdd }));

    result.current.sections[1].onAdd();

    expect(onAdd).toHaveBeenCalledWith("expense");
  });
});
