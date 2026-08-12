import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { useNavActive } from "@/components/AppShell/nav.hook.ts";
import { NAV } from "@/components/AppShell/nav.ts";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));

describe("useNavActive", () => {
  it("offers the whole nav and marks the current route", () => {
    jest.mocked(usePathname).mockReturnValue("/previsoes");

    const { result } = renderHook(() => useNavActive());

    expect(result.current.items).toBe(NAV);
    expect(result.current.isActive("/previsoes")).toBe(true);
    expect(result.current.isActive("/")).toBe(false);
  });
});
