import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useEntryRow } from "@/components/EntryRow/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Entry } from "@/lib/entry-types.ts";

const entry = {
  id: "e1",
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense",
  ownerId: "p1",
} as Entry;

const ana = { id: "p1", name: "ana", color: "violet" } as Person;

const props = {
  entry,
  period: "Ago/26",
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe("useEntryRow", () => {
  it("formats the amount and tints it by type", () => {
    const { result } = renderHook(() => useEntryRow({ ...props, person: ana }));

    expect(result.current.value).toBe("R$ 1.500,00");
    expect(result.current.valueClass).toContain("expense");
  });

  it("takes the owner's uppercased initial for the chip", () => {
    const { result } = renderHook(() => useEntryRow({ ...props, person: ana }));

    expect(result.current.initial).toBe("A");
    expect(result.current.owner).toBe("ana");
    expect(result.current.chipClass).toContain("violet");
  });

  it("keeps the chip box but empties it when the owner is unknown", () => {
    const { result } = renderHook(() => useEntryRow(props));

    expect(result.current.initial).toBeNull();
    expect(result.current.owner).toBe("—");
    expect(result.current.chipClass).toContain("chip");
  });

  it("takes a whole astral character, not half a surrogate pair", () => {
    const emoji = { id: "p1", name: "🐙 Ana" } as Person;
    const { result } = renderHook(() =>
      useEntryRow({ ...props, person: emoji }),
    );

    expect(result.current.initial).toBe("🐙");
  });

  it("reports no initial for a blank name", () => {
    const blank = { id: "p1", name: "   " } as Person;
    const { result } = renderHook(() =>
      useEntryRow({ ...props, person: blank }),
    );

    expect(result.current.initial).toBeNull();
  });

  it("passes the period, badges, band and actions through", () => {
    const { result } = renderHook(() =>
      useEntryRow({
        ...props,
        person: ana,
        badges: "flags",
        band: "barra",
      }),
    );

    expect(result.current).toMatchObject({
      name: "Aluguel",
      period: "Ago/26",
      badges: "flags",
      band: "barra",
      onEdit: props.onEdit,
      onDelete: props.onDelete,
    });
  });
});
