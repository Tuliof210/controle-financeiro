import { describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useConfirmDialog } from "@/components/ConfirmDialog/hook.ts";

describe("useConfirmDialog", () => {
  it("defaults to a destructive Excluir", () => {
    const { result } = renderHook(() =>
      useConfirmDialog({
        confirmLabel: undefined,
        danger: undefined,
        onConfirm: jest.fn<() => void>(),
      }),
    );

    expect(result.current).toMatchObject({
      confirmLabel: "Excluir",
      variant: "destructive",
      busy: false,
    });
  });

  it("uses the caller's label", () => {
    const { result } = renderHook(() =>
      useConfirmDialog({
        confirmLabel: "Importar",
        danger: undefined,
        onConfirm: jest.fn<() => void>(),
      }),
    );

    expect(result.current.confirmLabel).toBe("Importar");
  });

  it("drops to the primary variant when the action is not destructive", () => {
    const { result } = renderHook(() =>
      useConfirmDialog({
        confirmLabel: undefined,
        danger: false,
        onConfirm: jest.fn<() => void>(),
      }),
    );

    expect(result.current.variant).toBe("primary");
  });

  it("holds the confirm busy for exactly as long as the delete runs", async () => {
    let finish: () => void = jest.fn();
    const onConfirm = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useConfirmDialog({
        confirmLabel: undefined,
        danger: undefined,
        onConfirm,
      }),
    );

    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.confirm();
    });
    expect(result.current.busy).toBe(true);

    await act(async () => {
      finish();
      await pending;
    });

    expect(result.current.busy).toBe(false);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
