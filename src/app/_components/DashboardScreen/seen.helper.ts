import type { DashboardData } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";

export const SEEN_KEY = "dashboard-seen";

export interface SeenSnapshot {
  owner: string;
  monthlyCents: number;
  projectedEndCents: number;
}

export function snapshotFrom(
  data: DashboardData,
  owner: string,
): SeenSnapshot | undefined {
  if (data.status !== "ok") {
    return;
  }
  // An `ok` payload always types `points`, but an empty one still has no last
  // month to snapshot.
  const { points = [] } = data;
  const last = points.at(-1);
  if (!last) {
    return;
  }
  return {
    owner,
    monthlyCents: data.ceiling.monthly,
    projectedEndCents: last.cumulative,
  };
}

export function parseSeen(raw: string | null): SeenSnapshot | undefined {
  if (!raw) {
    return;
  }
  try {
    const value = JSON.parse(raw) as Partial<SeenSnapshot>;
    if (
      typeof value.owner === "string" &&
      typeof value.monthlyCents === "number" &&
      typeof value.projectedEndCents === "number"
    ) {
      return value as SeenSnapshot;
    }
  } catch {
    // Malformed storage: treat as a first visit.
  }
}

export function formatSeenLine(
  prev: SeenSnapshot | undefined,
  next: SeenSnapshot,
): string | undefined {
  if (!prev || prev.owner !== next.owner) {
    return;
  }
  const parts: string[] = [];
  if (prev.monthlyCents !== next.monthlyCents) {
    parts.push(
      `Teto do mês: ${formatMoney(prev.monthlyCents)} → ${formatMoney(next.monthlyCents)}.`,
    );
  }
  if (prev.projectedEndCents !== next.projectedEndCents) {
    parts.push(
      `Saldo projetado: ${formatMoney(prev.projectedEndCents)} → ${formatMoney(next.projectedEndCents)}.`,
    );
  }
  if (parts.length === 0) {
    return;
  }
  return parts.join(" ");
}
