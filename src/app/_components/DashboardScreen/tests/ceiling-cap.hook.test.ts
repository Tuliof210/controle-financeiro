import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCeilingCap } from "@/app/_components/DashboardScreen/ceiling-cap.hook.ts";

beforeEach(() => {
  localStorage.clear();
});

describe("useCeilingCap", () => {
  it("starts on the default cap", () => {
    const { result } = renderHook(() => useCeilingCap(false));

    expect(result.current.cap).toBe("50");
  });

  it("seeds meta once a goal is known and nothing is stored", async () => {
    const { result } = renderHook(() => useCeilingCap(true));

    await waitFor(() => expect(result.current.cap).toBe("meta"));
    expect(localStorage.getItem("ceiling-cap")).toBeNull();
  });

  it("keeps the default when nothing is stored and there is no goal", async () => {
    const { result } = renderHook(() => useCeilingCap(false));

    await waitFor(() => expect(result.current.cap).toBe("50"));
  });

  it("restores the remembered cap", async () => {
    localStorage.setItem("ceiling-cap", "75");

    const { result } = renderHook(() => useCeilingCap(true));

    await waitFor(() => expect(result.current.cap).toBe("75"));
  });

  it("does not leave meta selected when storage says meta but there is no goal", async () => {
    localStorage.setItem("ceiling-cap", "meta");

    const { result } = renderHook(() => useCeilingCap(false));

    await waitFor(() => expect(result.current.cap).toBe("50"));
  });

  it("restores stored meta once a goal is present", async () => {
    localStorage.setItem("ceiling-cap", "meta");
    const { result, rerender } = renderHook(
      ({ hasMeta }) => useCeilingCap(hasMeta),
      { initialProps: { hasMeta: false } },
    );

    await waitFor(() => expect(result.current.cap).toBe("50"));
    rerender({ hasMeta: true });
    await waitFor(() => expect(result.current.cap).toBe("meta"));
  });

  it("ignores a stored value it does not recognise", async () => {
    localStorage.setItem("ceiling-cap", "whatever");

    const { result } = renderHook(() => useCeilingCap(false));

    await waitFor(() => expect(result.current.cap).toBe("50"));
  });

  it("remembers the cap it is switched to", () => {
    const { result } = renderHook(() => useCeilingCap(true));

    act(() => {
      result.current.choose("25");
    });

    expect(result.current.cap).toBe("25");
    expect(localStorage.getItem("ceiling-cap")).toBe("25");
  });

  it("falls back to the default rather than storing an unknown cap", () => {
    const { result } = renderHook(() => useCeilingCap(false));

    act(() => {
      result.current.choose("nope");
    });

    expect(result.current.cap).toBe("50");
    expect(localStorage.getItem("ceiling-cap")).toBe("50");
  });
});
