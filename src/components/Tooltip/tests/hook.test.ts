import { describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useTooltip } from "@/components/Tooltip/hook.ts";

const keyEvent = (key: string) => {
  const stopPropagation = jest.fn();
  return {
    event: {
      key,
      stopPropagation,
    } as unknown as React.KeyboardEvent<HTMLButtonElement>,
    stopPropagation,
  };
};

describe("useTooltip", () => {
  it("starts visible and carries a stable id for aria-describedby", () => {
    const { result } = renderHook(() => useTooltip({ text: "Como sai" }));

    expect(result.current.dismissed).toBe(false);
    expect(result.current.id).toBeTruthy();
  });

  it("falls back to the generic trigger name", () => {
    const { result } = renderHook(() => useTooltip({ text: "x" }));

    expect(result.current.label).toBe("Como este número é calculado");
  });

  it("uses the caller's name when several tooltips share a screen", () => {
    const { result } = renderHook(() =>
      useTooltip({ text: "x", label: "Como Teto é calculado" }),
    );

    expect(result.current.label).toBe("Como Teto é calculado");
  });

  it("dismisses on Esc and consumes the keypress", () => {
    const { result } = renderHook(() => useTooltip({ text: "x" }));
    const { event, stopPropagation } = keyEvent("Escape");

    act(() => {
      result.current.onKeyDown(event);
    });

    expect(result.current.dismissed).toBe(true);
    expect(stopPropagation).toHaveBeenCalled();
  });

  it("ignores any other key", () => {
    const { result } = renderHook(() => useTooltip({ text: "x" }));
    const { event, stopPropagation } = keyEvent("Enter");

    act(() => {
      result.current.onKeyDown(event);
    });

    expect(result.current.dismissed).toBe(false);
    expect(stopPropagation).not.toHaveBeenCalled();
  });

  it("lets a second Esc through once already dismissed", () => {
    const { result } = renderHook(() => useTooltip({ text: "x" }));

    act(() => {
      result.current.onKeyDown(keyEvent("Escape").event);
    });
    const second = keyEvent("Escape");
    act(() => {
      result.current.onKeyDown(second.event);
    });

    expect(second.stopPropagation).not.toHaveBeenCalled();
  });

  it("re-arms so the next visit shows it again", () => {
    const { result } = renderHook(() => useTooltip({ text: "x" }));

    act(() => {
      result.current.onKeyDown(keyEvent("Escape").event);
    });
    act(() => {
      result.current.rearm();
    });

    expect(result.current.dismissed).toBe(false);
  });
});
