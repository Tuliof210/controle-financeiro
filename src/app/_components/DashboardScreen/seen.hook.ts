import { useEffect, useRef, useState } from "react";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import {
  formatSeenLine,
  parseSeen,
  seenKey,
  snapshotFrom,
} from "./seen.helper.ts";

export function useDashboardSeen(
  data: DashboardData | null,
  owner: string,
  cap: string,
): string | undefined {
  const [line, setLine] = useState<string>();
  const stamped = useRef<string | null>(null);

  useEffect(() => {
    if (data?.status !== "ok") {
      return;
    }
    const scope = `${owner}:${cap}`;
    if (stamped.current === scope) {
      return;
    }
    stamped.current = scope;
    const next = snapshotFrom(data, owner);
    if (!next) {
      return;
    }
    try {
      const key = seenKey(cap);
      const prev = parseSeen(localStorage.getItem(key));
      // Reassigned, not merged: the line on screen must belong to the cap on
      // screen, so a cap change replaces it rather than leaving the old one up.
      setLine(formatSeenLine(prev, next));
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage blocked: the snapshot is a convenience, not state.
    }
  }, [data, owner, cap]);

  return line;
}
