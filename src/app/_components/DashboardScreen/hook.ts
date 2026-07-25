import { useEffect, useState } from "react";
import type { DashboardData } from "@/app/api/dashboard/types";
import { useProfile } from "@/components/ProfileProvider/hook";
import { apiGet } from "@/lib/api";

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
      // unchecked result would render a failed load as an empty board.
      if (result.error) return setError(result.error);
      setData(result.data ?? null);
    });

    return () => {
      current = false;
    };
  }, [profile]);

  // null data with no error is still loading — distinct from an empty board.
  // (EntrySection seeds its list to [] and flashes its empty state on every
  // load; PeopleSection/GoalsSection use null to avoid exactly that.)
  return { data, error, loading: data === null && error === undefined };
}
