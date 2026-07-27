import { useEffect, useState } from "react";
import type { DashboardData } from "@/app/api/dashboard/types";
import { useProfile } from "@/components/ProfileProvider/hook";
import { apiGet } from "@/lib/api";

export type DashboardTab = "geral" | "projecao" | "metas";

export function useDashboardScreen() {
  // AppShell mounts ProfileProvider globally, so the context is already there.
  // Two things about `profile` that shape this effect: it is ALWAYS "familia"
  // on the first client render (the provider reads localStorage in an effect),
  // and it can briefly hold a deleted person's id until the provider self-heals
  // once /api/people resolves. Keying on it covers both — the corrected value
  // simply triggers another fetch.
  const { profile } = useProfile();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string>();
  // Local state, no `?tab=` URL parameter: this is a local app with no
  // deep-linking story, and a search param would cost a useSearchParams plus a
  // Suspense boundary for a toggle. The fetch below stays keyed on `profile`
  // alone, so switching tabs never refetches.
  const [tab, setTab] = useState<DashboardTab>("geral");

  useEffect(() => {
    let current = true;
    setData(null);
    setError(undefined);

    apiGet<DashboardData>(
      `/api/dashboard?owner=${encodeURIComponent(profile)}`,
    ).then((result) => {
      // A response for a profile we have already moved on from must not land.
      if (!current) return;
      // apiGet never rejects: every failure resolves to { error }, so an
      // unchecked result would render a failed load as an empty board. It also
      // returns `{ data: undefined }` for any 2xx whose body has no `data`
      // (a 204, an empty body) — `null` is this screen's loading sentinel, so
      // storing that would strand it on "Carregando" with nothing in flight.
      if (result.error || !result.data) {
        return setError(result.error ?? "Erro inesperado");
      }
      setData(result.data);
    });

    return () => {
      current = false;
    };
  }, [profile]);

  // null data with no error is still loading — distinct from an empty board.
  // (EntrySection seeds its list to [] and flashes its empty state on every
  // load; PeopleSection/GoalsSection use null to avoid exactly that.)
  return {
    data,
    error,
    loading: data === null && error === undefined,
    tab,
    onSelectTab: setTab,
  };
}
