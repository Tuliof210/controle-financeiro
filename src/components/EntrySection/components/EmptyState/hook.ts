import type { MvIconName } from "@/components/Icon/hook.ts";

export interface EmptyStateProps {
  // The section's own icon, reused as the illustration so the empty card still
  // reads as the same card.
  icon: MvIconName;
  title: string;
  hint: string;
}

export function useEmptyState(props: EmptyStateProps) {
  return props;
}
