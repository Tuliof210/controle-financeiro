import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useEntryForm } from "@/components/EntryForm/entry-form.hook.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";

jest.mock("../../ProfileProvider/hook.ts", () => ({ useProfile: jest.fn() }));

const profile = jest.mocked(useProfile);

const people = [
  { id: "p1", name: "Ana" },
  { id: "p2", name: "Bia" },
] as Person[];

beforeEach(() => {
  profile.mockReturnValue({ profile: "familia" } as never);
});

describe("useEntryForm", () => {
  it("starts empty, as an income owned by the first person", () => {
    const { result } = renderHook(() => useEntryForm(undefined, people));

    expect(result.current.fields).toMatchObject({
      name: "",
      valueCents: 0,
      type: "income",
      ownerId: "p1",
    });
    expect(result.current.isValid).toBe(false);
  });

  it("owns the entry by the active profile when it is a person", () => {
    profile.mockReturnValue({ profile: "p2" } as never);

    const { result } = renderHook(() => useEntryForm(undefined, people));

    expect(result.current.fields.ownerId).toBe("p2");
  });

  it("seeds from the entry being edited", () => {
    const { result } = renderHook(() =>
      useEntryForm(
        { name: "Luz", valueCents: 900, type: "expense", ownerId: "p2" },
        people,
      ),
    );

    expect(result.current.fields).toMatchObject({
      name: "Luz",
      valueCents: 900,
      type: "expense",
      ownerId: "p2",
    });
    expect(result.current.isValid).toBe(true);
  });

  it("becomes valid once the fields are filled in", () => {
    const { result } = renderHook(() => useEntryForm(undefined, people));

    act(() => {
      result.current.fields.setName("Luz");
      result.current.fields.setValueCents(900);
      result.current.fields.setType("expense");
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.base()).toEqual({
      name: "Luz",
      valueCents: 900,
      type: "expense",
      ownerId: "p1",
    });
  });

  it("carries a local error the feature hook sets", () => {
    const { result } = renderHook(() => useEntryForm(undefined, people));

    act(() => {
      result.current.setLocalError("Escolha um mês");
    });

    expect(result.current.localError).toBe("Escolha um mês");
  });
});
