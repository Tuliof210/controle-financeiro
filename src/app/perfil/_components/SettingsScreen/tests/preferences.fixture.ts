import type { DashboardData } from "@/app/api/dashboard/types.ts";
import { apiGet } from "@/lib/api.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";

// Shared by both halves of the preferences.hook suite (split for the 100-line
// cap). The hook fires two GETs on mount, so the mock has to answer by URL — a
// single mockResolvedValue would hand the settings payload to the dashboard.
export const STORED = {
  ...DEFAULT_SETTINGS,
  ceilingMode: "fixed" as const,
  ceilingCents: 700,
  goalsPercent: 30,
  showSimulated: true,
};

export const HEADROOM = 50_000;

export const okDashboard = {
  status: "ok",
  ceiling: { headroomCents: HEADROOM, monthly: 12_000 },
} as unknown as DashboardData;

export const emptyDashboard: DashboardData = { status: "no_range" };

// `null` stands for a dashboard GET that failed.
export function mockLoad(dashboard: DashboardData | null = okDashboard) {
  jest.mocked(apiGet).mockImplementation((url: string) => {
    if (url.startsWith("/api/settings")) {
      return Promise.resolve({ data: STORED }) as never;
    }
    if (dashboard === null) {
      return Promise.resolve({ error: "Erro ao carregar dashboard" }) as never;
    }
    return Promise.resolve({ data: dashboard }) as never;
  });
}
