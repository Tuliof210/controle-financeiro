import { useEffect, useRef, useState } from "react";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import {
  formatSeenLine,
  parseSeen,
  SEEN_KEY,
  snapshotFrom,
} from "./seen.helper.ts";

export function useDashboardSeen(
  data: DashboardData | null,
  owner: string,
): string | undefined {
  const [line, setLine] = useState<string>();
  const stamped = useRef<string | null>(null);

  useEffect(() => {
    if (data?.status !== "ok") {
      return;
    }
    if (stamped.current === owner) {
      return;
    }
    stamped.current = owner;
    const next = snapshotFrom(data, owner);
    if (!next) {
      return;
    }
    try {
      const prev = parseSeen(localStorage.getItem(SEEN_KEY));
      setLine(formatSeenLine(prev, next));
      localStorage.setItem(SEEN_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked: the snapshot is a convenience, not state.
    }
  }, [data, owner]);

  return line;
}
