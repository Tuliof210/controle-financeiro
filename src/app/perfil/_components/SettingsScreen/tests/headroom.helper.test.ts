import { describe, expect, it } from "@jest/globals";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import { previewFromDashboard } from "@/app/perfil/_components/SettingsScreen/headroom.helper.ts";

const ok = {
  status: "ok",
  ceiling: { headroomCents: 50_000, monthly: 12_000 },
} as unknown as DashboardData;

describe("previewFromDashboard", () => {
  it("reads the live teto from an ok payload", () => {
    expect(previewFromDashboard(ok, false)).toEqual({
      kind: "ok",
      maxCents: 50_000,
      monthlyCents: 12_000,
    });
  });

  it("says empty when there is no period", () => {
    expect(previewFromDashboard({ status: "no_range" }, false).kind).toBe(
      "empty",
    );
  });

  it("says error when the dashboard GET failed", () => {
    expect(previewFromDashboard(ok, true).kind).toBe("error");
    expect(previewFromDashboard(null, true).kind).toBe("error");
  });
});
