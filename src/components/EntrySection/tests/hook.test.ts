import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useEntrySection } from "@/components/EntrySection/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Entry } from "@/lib/entry-types.ts";

const items = [
  {
    id: "e1",
    name: "Aluguel",
    valueCents: 100,
    type: "expense",
    ownerId: "p1",
  },
  { id: "e2", name: "Luz", valueCents: 250, type: "expense", ownerId: "px" },
] as Entry[];

const people = [{ id: "p1", name: "Ana" }] as Person[];

const props = {
  title: "Saídas",
  icon: "wallet" as const,
  tone: "negative" as const,
  items,
  people,
  period: { start: 202_601, end: 202_612 },
  labels: { add: "Nova saída", emptyTitle: "Nada", emptyHint: "Adicione" },
  renderPeriod: (item: Entry) => `periodo de ${item.name}`,
  onAdd: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("useEntrySection", () => {
  it("resolves each row's owner once, leaving it undefined when unknown", () => {
    const { result } = renderHook(() => useEntrySection(props));

    expect(result.current.rows[0].person).toEqual(people[0]);
    expect(result.current.rows[1].person).toBeUndefined();
  });

  it("renders the period per row through the caller's function", () => {
    const { result } = renderHook(() => useEntrySection(props));

    expect(result.current.rows[0].period).toBe("periodo de Aluguel");
  });

  it("threads badges only when the caller draws them", () => {
    expect(
      renderHook(() => useEntrySection(props)).result.current.rows[0].badges,
    ).toBeUndefined();

    const { result } = renderHook(() =>
      useEntrySection({ ...props, renderBadges: () => "flags" }),
    );

    expect(result.current.rows[0].badges).toBe("flags");
  });

  it("leaves the band absent unless the entity draws one", () => {
    const { result } = renderHook(() => useEntrySection(props));

    expect(result.current.rows[0].band).toBeUndefined();
  });

  it("draws the band when the caller provides one", () => {
    const { result } = renderHook(() =>
      useEntrySection({ ...props, renderBand: () => "barra" }),
    );

    expect(result.current.rows[0].band).toBe("barra");
  });

  it("totals the rows it is showing", () => {
    const { result } = renderHook(() => useEntrySection(props));

    expect(result.current.total).toBe("R$ 3,50");
  });

  it("totals zero for an empty section", () => {
    const { result } = renderHook(() =>
      useEntrySection({ ...props, items: [] }),
    );

    expect(result.current.total).toBe("R$ 0,00");
    expect(result.current.rows).toEqual([]);
  });

  it("binds each row's actions to its own item", () => {
    const onDelete = jest.fn();
    const { result } = renderHook(() =>
      useEntrySection({ ...props, onDelete }),
    );

    result.current.rows[1].onDelete();

    expect(onDelete).toHaveBeenCalledWith(items[1]);
  });
});
