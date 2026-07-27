export type ShowAllToggleProps = { label: string; onClick: () => void };

export function useShowAllToggle({ label, onClick }: ShowAllToggleProps) {
  return { label, onClick };
}
