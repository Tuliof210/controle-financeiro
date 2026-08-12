import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { usePersonRow } from "@/app/configuracoes/_components/SettingsScreen/components/PeopleSection/components/PersonRow/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";

const person = { id: "p1", name: "Ana", color: "violet" } as Person;

describe("usePersonRow", () => {
  it("resolves the swatch class from the person's colour", () => {
    const { result } = renderHook(() =>
      usePersonRow({ person, onEdit: jest.fn(), onDelete: jest.fn() }),
    );

    expect(result.current.name).toBe("Ana");
    expect(result.current.swatchClass).toContain("violet");
  });

  it("binds both actions to its own person", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { result } = renderHook(() =>
      usePersonRow({ person, onEdit, onDelete }),
    );

    result.current.onEdit();
    result.current.onDelete();

    expect(onEdit).toHaveBeenCalledWith(person);
    expect(onDelete).toHaveBeenCalledWith(person);
  });
});
