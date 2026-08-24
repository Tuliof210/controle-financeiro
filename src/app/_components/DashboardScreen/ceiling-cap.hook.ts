import { useCallback, useEffect, useState } from "react";
import {
  CEILING_CAPS,
  type CeilingCap,
  DEFAULT_CEILING_CAP,
  META_CAP,
} from "@/lib/ceiling-caps.ts";

const KEY = "ceiling-cap";

function isCap(value: string | null): value is CeilingCap {
  return CEILING_CAPS.includes(value as CeilingCap);
}

// Role-suffixed rather than hook.ts: a folder's hook.ts is called by its OWN
// index.tsx, and this one is called by the screen hook, the way
// simulation.hook.ts is.
//
// Persisted like the simulation view (owner's decision, 2026-08-23): the cap is
// the allowance, and a reload should not throw the reader back to a guess.
// Read in an effect rather than in the useState initialiser, so the first
// client render matches the server's — ProfileProvider does the same, and the
// bare try/catch is that file's too, for a localStorage a browser can refuse.
//
// `hasMeta` is false until a payload with a saved goal lands. Returning META
// before that would put `cap=meta` on the wire while `data.meta` is still null.
export function useCeilingCap(hasMeta: boolean) {
  const [cap, setCap] = useState<CeilingCap>(DEFAULT_CEILING_CAP);
  const [seed, setSeed] = useState<"pending" | "stored" | "empty">("pending");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (isCap(stored)) {
        setCap(stored);
        setSeed("stored");
        return;
      }
    } catch {
      // Storage blocked: the remembered cap is a convenience, not state.
    }
    setSeed("empty");
  }, []);

  useEffect(() => {
    if (seed !== "empty" || !hasMeta) {
      return;
    }
    setCap(META_CAP);
  }, [seed, hasMeta]);

  const choose = useCallback((next: string) => {
    let value: CeilingCap = DEFAULT_CEILING_CAP;
    if (isCap(next)) {
      value = next;
    }
    setCap(value);
    setSeed("stored");
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // Storage blocked: the choice still applies to this session.
    }
  }, []);

  let resolved = cap;
  if (cap === META_CAP && !hasMeta) {
    resolved = DEFAULT_CEILING_CAP;
  }
  return {
    cap: resolved,
    choose,
  };
}
