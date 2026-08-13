export interface ShowAllToggleProps {
  label: string;
  // The disclosure state, for aria-expanded. Not derivable from `label`:
  // matching on the copy would break the moment the wording changes.
  expanded: boolean;
  onClick: () => void;
}

export function useShowAllToggle({
  label,
  expanded,
  onClick,
}: ShowAllToggleProps) {
  return { label, expanded, onClick };
}
