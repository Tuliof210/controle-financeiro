import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useConfirmDialog } from "@/components/ConfirmDialog/hook.ts";

describe("useConfirmDialog", () => {
  it("defaults to a destructive Excluir", () => {
    const { result } = renderHook(() =>
      useConfirmDialog({ confirmLabel: undefined, danger: undefined }),
    );

    expect(result.current).toEqual({
      confirmLabel: "Excluir",
      variant: "danger",
    });
  });

  it("uses the caller's label", () => {
    const { result } = renderHook(() =>
      useConfirmDialog({ confirmLabel: "Importar", danger: undefined }),
    );

    expect(result.current.confirmLabel).toBe("Importar");
  });

  it("drops to the primary variant when the action is not destructive", () => {
    const { result } = renderHook(() =>
      useConfirmDialog({ confirmLabel: undefined, danger: false }),
    );

    expect(result.current.variant).toBe("primary");
  });
});
