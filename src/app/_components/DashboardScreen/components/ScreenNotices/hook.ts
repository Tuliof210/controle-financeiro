import type { DashboardData } from "@/app/api/dashboard/types.ts";

interface ScreenNoticesProps {
  loading: boolean;
  error: string | undefined;
  data: DashboardData | null;
  onRetry: () => void;
}

// Narrowed here rather than in the view: the view must not have to re-ask a
// question the discriminated union already answered.
function rangeOutside(data: DashboardData | null) {
  if (data?.status === "out_of_range") {
    return data.range;
  }
  return null;
}

function useScreenNotices({
  loading,
  error,
  data,
  onRetry,
}: ScreenNoticesProps) {
  return {
    loading,
    error,
    onRetry,
    noRange: data?.status === "no_range",
    outOfRange: rangeOutside(data),
  };
}

export type { ScreenNoticesProps };
export { useScreenNotices };
