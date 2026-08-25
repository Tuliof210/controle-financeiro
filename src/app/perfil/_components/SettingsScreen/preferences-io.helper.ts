import type { DashboardData } from "@/app/api/dashboard/types.ts";
import type { Settings } from "@/core/entities/settings.entity.ts";
import { apiGet, apiPut } from "@/lib/api.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults.ts";
import {
  type CeilingPreview,
  previewFromDashboard,
} from "./headroom.helper.ts";

const DASHBOARD = `/api/dashboard?owner=${FAMILY_PROFILE}`;

export function fetchPrefs() {
  return Promise.all([
    apiGet<Settings | null>("/api/settings"),
    apiGet<DashboardData>(DASHBOARD),
  ]);
}

export function storedOf(data: Settings | null | undefined): Settings {
  if (data === undefined || data === null) {
    return DEFAULT_SETTINGS;
  }
  return data;
}

export function putSettings(next: Settings) {
  return apiPut("/api/settings", next);
}

export async function refreshPreview(): Promise<CeilingPreview> {
  const dash = await apiGet<DashboardData>(DASHBOARD);
  return previewFromDashboard(dash.data, Boolean(dash.error));
}
