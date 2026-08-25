import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useCeilingSection } from "@/app/perfil/_components/SettingsScreen/components/CeilingSection/hook.ts";

const base = {
  mode: "percent" as const,
  percent: 50,
  cents: 700,
  headroomKind: "ok" as const,
  maxCents: 50_000,
  monthlyCents: 12_000,
  onModeChange: jest.fn(),
  onPercentChange: jest.fn(),
  onCentsChange: jest.fn(),
};

describe("useCeilingSection", () => {
  it("hands the percentage to Field's text arm as a string", () => {
    const { result } = renderHook(() => useCeilingSection(base));

    expect(result.current.isPercent).toBe(true);
    expect(result.current.percentValue).toBe("50");
    expect(result.current.showFigure).toBe(true);
  });

  it("names the maximum a fixed ceiling may reach", () => {
    const { result } = renderHook(() =>
      useCeilingSection({ ...base, mode: "fixed" }),
    );

    expect(result.current.isPercent).toBe(false);
    expect(result.current.maxHint).toContain("R$ 500,00");
  });

  it("says there is nothing to respect when there is no period", () => {
    const { result } = renderHook(() =>
      useCeilingSection({
        ...base,
        maxCents: null,
        monthlyCents: null,
        headroomKind: "empty",
      }),
    );

    expect(result.current.maxHint).toContain("não há máximo");
    expect(result.current.showFigure).toBe(false);
  });
});
