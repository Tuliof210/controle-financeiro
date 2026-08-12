import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useAppShell } from "@/components/AppShell/hook.ts";

// jsdom has no matchMedia, and the shell reads it to pick which control to drive.
let listener: () => void;

const stubMatchMedia = (matches: boolean) => {
  const mql = {
    matches,
    addEventListener: (_: string, handler: () => void) => {
      listener = handler;
    },
    removeEventListener: jest.fn(),
  };
  globalThis.matchMedia = (() =>
    mql) as unknown as typeof globalThis.matchMedia;
  return mql;
};

beforeEach(() => {
  stubMatchMedia(false);
});

describe("useAppShell", () => {
  it("starts mobile-first: nothing collapsed, no drawer", () => {
    const { result } = renderHook(() => useAppShell());

    expect(result.current).toMatchObject({
      collapsed: false,
      drawerOpen: false,
      expanded: false,
    });
  });

  it("opens and closes the drawer below the breakpoint", () => {
    const { result } = renderHook(() => useAppShell());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.drawerOpen).toBe(true);
    expect(result.current.expanded).toBe(true);
    expect(result.current.collapsed).toBe(false);

    act(() => {
      result.current.closeDrawer();
    });

    expect(result.current.drawerOpen).toBe(false);
  });

  it("collapses the rail instead at desktop width", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useAppShell());

    expect(result.current.expanded).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.collapsed).toBe(true);
    expect(result.current.expanded).toBe(false);
    expect(result.current.drawerOpen).toBe(false);
  });

  it("drops an open drawer when the viewport crosses to desktop", () => {
    const mql = stubMatchMedia(false);
    const { result } = renderHook(() => useAppShell());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.drawerOpen).toBe(true);

    act(() => {
      mql.matches = true;
      listener();
    });

    expect(result.current.drawerOpen).toBe(false);
  });

  it("never leaks a desktop collapse into the drawer width", () => {
    const mql = stubMatchMedia(true);
    const { result } = renderHook(() => useAppShell());

    act(() => {
      result.current.toggle();
    });
    act(() => {
      mql.matches = false;
      listener();
    });

    expect(result.current.collapsed).toBe(false);
  });
});
