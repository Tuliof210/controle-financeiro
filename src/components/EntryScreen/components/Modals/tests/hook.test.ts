import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useModals } from "@/components/EntryScreen/components/Modals/hook.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";

describe("useModals", () => {
  it("hands its props straight back, the narrowing living in the JSX", () => {
    const props = {
      labels: { addTitle: "Nova", editTitle: "Editar" },
      modal: { type: "none" } as const,
      close: jest.fn(),
      people: [],
      onAdd: jest.fn(),
      onUpdate: jest.fn(),
      form: () => null,
    };

    const { result } = renderHook(() =>
      useModals<Entry, { type: EntryType }>(props),
    );

    expect(result.current).toBe(props);
  });
});
