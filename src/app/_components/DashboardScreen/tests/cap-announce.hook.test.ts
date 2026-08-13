import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useCapAnnouncement } from "@/app/_components/DashboardScreen/cap-announce.hook.ts";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";

const board = (monthly: number) =>
  ({ ceiling: { monthly } }) as unknown as BoardData;

describe("useCapAnnouncement", () => {
  // The reader navigated here; they do not need to be told the page loaded.
  it("says nothing before the first refresh", () => {
    const { result } = renderHook(() => useCapAnnouncement(board(1000), false));

    expect(result.current).toBe("");
  });

  it("says the work is happening while it is in flight", () => {
    const { result } = renderHook(() => useCapAnnouncement(board(1000), true));

    expect(result.current).toBe("Atualizando o teto…");
  });

  // The settled FIGURE, not the request: what a reader needs is which number is
  // on screen now.
  it("names the new figure once the refresh settles", () => {
    const { result, rerender } = renderHook(
      ({ monthly, refreshing }: { monthly: number; refreshing: boolean }) =>
        useCapAnnouncement(board(monthly), refreshing),
      { initialProps: { monthly: 1000, refreshing: true } },
    );

    rerender({ monthly: 578_945, refreshing: false });

    expect(result.current).toBe("Teto atualizado: R$ 5.789,45 por mês");
  });

  it("clears the settled line when another refresh starts", () => {
    const { result, rerender } = renderHook(
      ({ refreshing }: { refreshing: boolean }) =>
        useCapAnnouncement(board(1000), refreshing),
      { initialProps: { refreshing: true } },
    );

    rerender({ refreshing: false });
    expect(result.current).toBe("Teto atualizado: R$ 10,00 por mês");

    rerender({ refreshing: true });
    expect(result.current).toBe("Atualizando o teto…");
  });
});
