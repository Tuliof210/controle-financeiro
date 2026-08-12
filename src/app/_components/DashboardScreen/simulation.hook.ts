import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SIMULATION_VIEW,
  SIMULATION_VIEWS,
  type SimulationView,
} from "@/lib/simulation.ts";

const KEY = "simulation";

// A stored value can be anything — an older build's vocabulary, a hand-edited
// key — and an unknown one must read as the default rather than reach the URL.
function isView(value: string | null): value is SimulationView {
  return SIMULATION_VIEWS.includes(value as SimulationView);
}

// Role-suffixed rather than hook.ts, the way show-all.hook.ts is: a folder's
// hook.ts is called by its OWN index.tsx, and this one is called by another
// hook.
//
// Persisted, unlike `cap` (owner's decision, 2026-07-31): someone exploring a
// scenario keeps exploring it across reloads, where a cap is a setting you read
// once. Read in an effect rather than in the useState initialiser, so the first
// client render matches the server's — ProfileProvider does the same, and the
// bare try/catch is that file's too, for a localStorage a browser can refuse.
export function useSimulationView() {
  const [view, setView] = useState<SimulationView>(DEFAULT_SIMULATION_VIEW);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (isView(stored)) setView(stored);
    } catch {}
  }, []);

  const choose = useCallback((next: string) => {
    const value = isView(next) ? next : DEFAULT_SIMULATION_VIEW;
    setView(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {}
  }, []);

  return { view, choose };
}
