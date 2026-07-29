import type { LucideIcon } from "lucide-react";

export type EmptyStateProps = {
  // The section's own icon, reused as the illustration so the empty card still
  // reads as the same card.
  icon: LucideIcon;
  title: string;
  hint: string;
};

export function useEmptyState(props: EmptyStateProps) {
  return props;
}
