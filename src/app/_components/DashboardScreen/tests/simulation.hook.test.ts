import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useSimulationView } from "@/app/_components/DashboardScreen/simulation.hook.ts";

beforeEach(() => {
  localStorage.clear();
});

describe("useSimulationView", () => {
  it("starts on the real view", () => {
    const { result } = renderHook(() => useSimulationView());

    expect(result.current.view).toBe("real");
  });

  it("restores the remembered view", async () => {
    localStorage.setItem("simulation", "all");

    const { result } = renderHook(() => useSimulationView());

    await waitFor(() => expect(result.current.view).toBe("all"));
  });

  it("ignores a stored value it does not recognise", async () => {
    localStorage.setItem("simulation", "whatever");

    const { result } = renderHook(() => useSimulationView());

    await waitFor(() => expect(result.current.view).toBe("real"));
  });

  it("remembers the view it is switched to", () => {
    const { result } = renderHook(() => useSimulationView());

    act(() => {
      result.current.choose("all");
    });

    expect(result.current.view).toBe("all");
    expect(localStorage.getItem("simulation")).toBe("all");
  });

  it("falls back to the default rather than storing an unknown view", () => {
    const { result } = renderHook(() => useSimulationView());

    act(() => {
      result.current.choose("nope");
    });

    expect(result.current.view).toBe("real");
    expect(localStorage.getItem("simulation")).toBe("real");
  });
});
