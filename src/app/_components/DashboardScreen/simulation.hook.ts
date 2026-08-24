import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SIMULATION_VIEW,
  isSimulationView,
  SIMULATION_KEY,
  type SimulationView,
} from "@/lib/simulation.ts";

// Role-suffixed rather than hook.ts, the way show-all.hook.ts is: a folder's
// hook.ts is called by its OWN index.tsx, and this one is called by another
// hook.
//
// Persisted: someone exploring a scenario keeps exploring it across reloads.
// Read in an effect rather than in the useState initialiser, so the first
// client render matches the server's — ProfileProvider does the same, and the
// bare try/catch is that file's too, for a localStorage a browser can refuse.
export function useSimulationView() {
  const [view, setView] = useState<SimulationView>(DEFAULT_SIMULATION_VIEW);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIMULATION_KEY);
      if (isSimulationView(stored)) {
        setView(stored);
      }
    } catch {
      // Storage blocked: the remembered view is a convenience, not state.
    }
  }, []);

  const choose = useCallback((next: string) => {
    let value: SimulationView = DEFAULT_SIMULATION_VIEW;
    if (isSimulationView(next)) {
      value = next;
    }
    setView(value);
    try {
      localStorage.setItem(SIMULATION_KEY, value);
    } catch {
      // Storage blocked: the choice still applies to this session.
    }
  }, []);

  return { view, choose };
}
