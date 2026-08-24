import { useEffect, useState } from "react";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";
import { useCeilingCap } from "./ceiling-cap.hook.ts";
import { heldFor } from "./dashboard-held.helper.ts";
import { useSimulationView } from "./simulation.hook.ts";

export function useDashboardScreen() {
  // AppShell mounts ProfileProvider globally, so the context is already there.
  // Two things about `profile` that shape this effect: it is ALWAYS "familia"
  // on the first client render (the provider reads localStorage in an effect),
  // and it can briefly hold a deleted person's id until the provider self-heals
  // once /api/people resolves. Keying on it covers both — the corrected value
  // simply triggers another fetch.
  const { profile } = useProfile();
  // Tagged with the owner it was fetched for, and that tag is load-bearing.
  // Keeping the board mounted through a CAP change is the point — same money,
  // different setting. Keeping it through a PROFILE change is not: it would
  // leave one person's figures on screen under another person's name until the
  // new payload lands, unlabelled. Tagging lets one flag answer both.
  const [held, setHeld] = useState<{
    owner: string;
    payload: DashboardData;
  } | null>(null);
  const [error, setError] = useState<string>();
  // Persisted, and so held in its own hook — see simulation.hook.ts.
  const { view: simulation, choose: setSimulation } = useSimulationView();
  // Two questions `data === null` used to answer at once: "nothing to show" and
  // "a request is in flight". Only the first belongs to the data. Every cap
  // change re-runs this effect, and blanking unmounted the whole board — both
  // charts, the goal rows, an expanded month table, and the very button that
  // had just been clicked.
  const [pending, setPending] = useState(true);

  // Nothing held for the profile on screen means nothing honest to show, so the
  // board goes and the notice takes over. Read before the cap hook: seeding
  // Meta needs to know whether this payload carries a saved goal.
  const data = heldFor(held, profile);
  const hasMeta = data?.status === "ok" && typeof data.meta === "number";
  const { cap, choose: setCap } = useCeilingCap(hasMeta);

  useEffect(() => {
    let current = true;
    setPending(true);
    setError(undefined);

    apiGet<DashboardData>(
      `/api/dashboard?owner=${encodeURIComponent(profile)}&cap=${cap}&simulation=${simulation}`,
    ).then((result) => {
      // A response for a profile or cap we have already moved on from must not
      // land. This is also what makes serving the last-good `data` while a
      // request is in flight safe: an out-of-order response still cannot win.
      if (!current) {
        return;
      }
      setPending(false);
      // apiGet never rejects: every failure resolves to { error }, so an
      // unchecked result would render a failed load as an empty board. It also
      // returns `{ data: undefined }` for any 2xx whose body has no `data`
      // (a 204, an empty body), which would strand the screen showing figures
      // from the previous request with nothing to say they are stale.
      if (result.error || !result.data) {
        return setError(result.error ?? "Erro inesperado");
      }
      setHeld({ owner: profile, payload: result.data });
    });

    return () => {
      current = false;
    };
  }, [profile, cap, simulation]);

  return {
    data,
    error,
    // Nothing rendered yet, so there is nothing to keep on screen.
    // (EntrySection seeds its list to [] and flashes its empty state on every
    // load; PeopleSection and GoalsSection use null to avoid exactly that.)
    loading: pending && data === null && error === undefined,
    // A cap change revalidates in place instead: what is on screen is still an
    // honest read of the same person's money, and replacing it with a spinner
    // loses the reader's scroll position and the card's expanded state.
    refreshing: pending && data !== null,
    cap,
    setCap,
    simulation,
    setSimulation,
  };
}
