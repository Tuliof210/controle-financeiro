import type { DashboardData } from "@/app/api/dashboard/types.ts";
import {
  CEILING_CAPS,
  type CeilingCap,
  META_CAP,
} from "@/lib/ceiling-caps.ts";
import { formatMoney } from "@/lib/money.ts";
import {
  DEFAULT_SIMULATION_VIEW,
  SIMULATION_VIEWS,
  type SimulationView,
} from "@/lib/simulation.ts";

const CAP_KEY = "ceiling-cap";
const SIMULATION_KEY = "simulation";

// META, not the "50" default: useCeilingCap seeds Meta whenever nothing is
// stored and the payload carries a saved goal, and it never writes that seed
// back. Falling back to "50" here made the notice quote a ceiling 3.4x the one
// on the card. Asking for Meta without a goal is safe — the route's targetCap
// downgrades it to the default, which is the same rule the hook resolves by.
function storedCap(): CeilingCap {
  return readStored(CAP_KEY, CEILING_CAPS, META_CAP);
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

// The dashboard read has to match what the dashboard itself would ask for, or
// the delta compares two different caps.
export function dashboardPath(owner: string): string {
  return `/api/dashboard?owner=${encodeURIComponent(owner)}&cap=${storedCap()}&simulation=${storedSimulation()}`;
}
