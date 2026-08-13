export interface ShowAllToggleProps {
  label: string;
  // The disclosure state, for aria-expanded. Not derivable from `label`:
  // matching on the copy would break the moment the wording changes.
  expanded: boolean;
  // What it expands. aria-expanded said the button HAS a state; without this
  // nothing said which region that state belongs to — and this button renders
  // AFTER the rows it reveals, so an assistive reader had no way back to them.
  controls: string;
  onClick: () => void;
}

export function useShowAllToggle({
  label,
  expanded,
  controls,
  onClick,
}: ShowAllToggleProps) {
  return { label, expanded, controls, onClick };
}
