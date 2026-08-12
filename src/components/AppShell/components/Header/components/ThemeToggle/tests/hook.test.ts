import { beforeEach, describe, expect, it } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useThemeToggle } from "@/components/AppShell/components/Header/components/ThemeToggle/hook.ts";

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
  localStorage.clear();
});

describe("useThemeToggle", () => {
  it("reads the theme already on the document", async () => {
    document.documentElement.setAttribute("data-theme", "dark");

    const { result } = renderHook(() => useThemeToggle());

    await waitFor(() => expect(result.current.theme).toBe("dark"));
    expect(result.current.icon).toBe("sun");
    expect(result.current.ariaLabel).toBe("Ativar tema claro");
  });

  it("reads an unset attribute as light", async () => {
    const { result } = renderHook(() => useThemeToggle());

    await waitFor(() => expect(result.current.theme).toBe("light"));
    expect(result.current.icon).toBe("moon");
  });

  it("flips the document attribute and remembers the choice", async () => {
    const { result } = renderHook(() => useThemeToggle());
    await waitFor(() => expect(result.current.theme).toBe("light"));

    act(() => {
      result.current.toggle();
    });

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(result.current.theme).toBe("dark");
  });

  it("flips back on a second press", async () => {
    document.documentElement.setAttribute("data-theme", "dark");
    const { result } = renderHook(() => useThemeToggle());
    await waitFor(() => expect(result.current.theme).toBe("dark"));

    act(() => {
      result.current.toggle();
    });

    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
