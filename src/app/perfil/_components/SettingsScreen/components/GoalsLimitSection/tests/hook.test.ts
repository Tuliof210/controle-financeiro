import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useGoalsLimitSection } from "@/app/perfil/_components/SettingsScreen/components/GoalsLimitSection/hook.ts";

const base = {
  mode: "percent" as const,
  percent: 25,
  cents: 700,
  headroomKind: "ok" as const,
  maxCents: 50_000,
  onModeChange: jest.fn(),
  onPercentChange: jest.fn(),
  onCentsChange: jest.fn(),
};

describe("useGoalsLimitSection", () => {
  it("hands the percentage to Field's text arm as a string", () => {
    const { result } = renderHook(() => useGoalsLimitSection(base));

    expect(result.current.isPercent).toBe(true);
    expect(result.current.percentValue).toBe("25");
  });

  it("names the maximum a fixed limit may reach", () => {
    const { result } = renderHook(() =>
      useGoalsLimitSection({ ...base, mode: "fixed" }),
    );

    expect(result.current.maxHint).toContain("R$ 500,00");
  });

  it("says there is nothing to respect when there is no period", () => {
    const { result } = renderHook(() =>
      useGoalsLimitSection({
        ...base,
        maxCents: null,
        headroomKind: "empty",
      }),
    );

    expect(result.current.maxHint).toContain("não há máximo");
  });
});
