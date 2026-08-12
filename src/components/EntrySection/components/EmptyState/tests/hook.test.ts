import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { Wallet } from "lucide-react";
import { useEmptyState } from "@/components/EntrySection/components/EmptyState/hook.ts";

describe("useEmptyState", () => {
  it("hands the section's own icon and copy straight back", () => {
    const props = { icon: Wallet, title: "Nada aqui", hint: "Adicione um" };
    const { result } = renderHook(() => useEmptyState(props));

    expect(result.current).toBe(props);
  });
});
