import type { DashboardData } from "@/app/api/dashboard/types.ts";
import {
  CEILING_CAPS,
  type CeilingCap,
  DEFAULT_CEILING_CAP,
} from "@/lib/ceiling-caps.ts";
import { formatMoney } from "@/lib/money.ts";
import {
  DEFAULT_SIMULATION_VIEW,
  SIMULATION_VIEWS,
  type SimulationView,
} from "@/lib/simulation.ts";

const CAP_KEY = "ceiling-cap";
const SIMULATION_KEY = "simulation";

export function monthlyFrom(
  data: DashboardData | undefined,
): number | undefined {
  if (data?.status === "ok") {
    return data.ceiling.monthly;
  }
}

export function formatCeilingDelta(
  before: number | undefined,
  after: number | undefined,
): string | undefined {
  if (after === undefined) {
    return;
  }
  const afterMoney = formatMoney(after);
  if (before === undefined) {
    return `Teto deste mês: ${afterMoney}.`;
  }
  return `Teto deste mês: ${formatMoney(before)} → ${afterMoney}.`;
}

export function dashboardPath(owner: string): string {
  return `/api/dashboard?owner=${encodeURIComponent(owner)}&cap=${storedCap()}&simulation=${storedSimulation()}`;
}

function storedCap(): CeilingCap {
  return readStored(CAP_KEY, CEILING_CAPS, DEFAULT_CEILING_CAP);
}

function storedSimulation(): SimulationView {
  return readStored(SIMULATION_KEY, SIMULATION_VIEWS, DEFAULT_SIMULATION_VIEW);
}

function readStored<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored && allowed.includes(stored as T)) {
      return stored as T;
    }
  } catch {
    // Storage blocked: same default the dashboard itself would use.
  }
  return fallback;
}
