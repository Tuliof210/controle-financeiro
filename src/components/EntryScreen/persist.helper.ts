import type { DashboardData } from "@/app/api/dashboard/types.ts";
import { apiGet } from "@/lib/api.ts";
import {
  dashboardPath,
  formatCeilingDelta,
  monthlyFrom,
} from "./ceiling-delta.helper.ts";

interface WriteResult {
  error?: string;
}

// A ceiling read that fails is not a failed save: it drops the "before" half of
// the delta and nothing else.
async function readMonthly(owner: string): Promise<number | undefined> {
  const result = await apiGet<DashboardData>(dashboardPath(owner));
  if (result.error) {
    return;
  }
  return monthlyFrom(result.data);
}

export async function persistWithDelta(
  owner: string,
  write: () => Promise<WriteResult>,
): Promise<{ error?: string; notice?: string }> {
  const before = await readMonthly(owner);
  const result = await write();
  if (result.error) {
    return { error: result.error };
  }
  const after = await readMonthly(owner);
  return { notice: formatCeilingDelta(before, after) };
}
