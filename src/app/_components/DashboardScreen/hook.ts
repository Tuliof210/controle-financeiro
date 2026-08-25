import { useEffect, useState } from "react";
import type { DashboardData } from "@/app/api/dashboard/types.ts";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import { apiGet } from "@/lib/api.ts";
import { heldFor } from "./dashboard-held.helper.ts";

export function useDashboardScreen() {
  // AppShell mounts ProfileProvider globally, so the context is already there.
  // Two things about `profile` that shape this effect: it is ALWAYS "familia"
  // on the first client render (the provider reads localStorage in an effect),
  // and it can briefly hold a deleted person's id until the provider self-heals
  // once /api/people resolves. Keying on it covers both — the corrected value
  // simply triggers another fetch.
  const { profile } = useProfile();
  // Tagged with the owner it was fetched for, and that tag is load-bearing:
  // keeping one person's figures on screen under another person's name until
  // the new payload lands, unlabelled, is what it prevents.
  const [held, setHeld] = useState<{
    owner: string;
    payload: DashboardData;
  } | null>(null);
  const [error, setError] = useState<string>();
  // Two questions `data === null` used to answer at once: "nothing to show" and
  // "a request is in flight". Only the first belongs to the data — blanking on
  // every refetch unmounted the whole board, both charts, the goal rows and an
  // expanded month table.
  const [pending, setPending] = useState(true);

  useEffect(() => {
    let current = true;
    setPending(true);
    setError(undefined);

    apiGet<DashboardData>(
      `/api/dashboard?owner=${encodeURIComponent(profile)}`,
    ).then((result) => {
      // A response for a profile we have already moved on from must not land.
      // This is also what makes serving the last-good `data` while a request is
      // in flight safe: an out-of-order response still cannot win.
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
  }, [profile]);

  // Nothing held for the profile on screen means nothing honest to show, so the
  // board goes and the notice takes over.
  const data = heldFor(held, profile);

  return {
    data,
    error,
    // Nothing rendered yet, so there is nothing to keep on screen.
    // (EntrySection seeds its list to [] and flashes its empty state on every
    // load; PeopleSection and GoalsSection use null to avoid exactly that.)
    loading: pending && data === null && error === undefined,
    // A profile change revalidates in place instead of blanking: replacing the
    // board with a spinner loses the reader's scroll position and the card's
    // expanded state.
    refreshing: pending && data !== null,
  };
}
