import type { DashboardData } from "@/app/api/dashboard/types.ts";

export type HeadroomKind = "ok" | "empty" | "error";

export interface CeilingPreview {
  kind: HeadroomKind;
  maxCents: number | null;
  monthlyCents: number | null;
}

export const EMPTY_PREVIEW: CeilingPreview = {
  kind: "empty",
  maxCents: null,
  monthlyCents: null,
};

export const ERROR_PREVIEW: CeilingPreview = {
  kind: "error",
  maxCents: null,
  monthlyCents: null,
};

export function previewFromDashboard(
  data: DashboardData | undefined | null,
  failed: boolean,
): CeilingPreview {
  if (failed) {
    return ERROR_PREVIEW;
  }
  if (data === undefined || data === null || data.status !== "ok") {
    return EMPTY_PREVIEW;
  }
  return {
    kind: "ok",
    maxCents: data.ceiling.headroomCents,
    monthlyCents: data.ceiling.monthly,
  };
}
