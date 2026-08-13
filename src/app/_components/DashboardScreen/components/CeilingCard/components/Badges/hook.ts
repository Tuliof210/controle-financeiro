interface BadgesProps {
  // Which month or goal bound this month's figure, or null when nothing does.
  limitedBy: string | null;
  // The month in view, and the clipped word that explains what it is. That word
  // replaces a hover-only `title`, which touch never reached.
  currentLabel: string;
  currentPrefix: string;
}

function useBadges({ limitedBy, currentLabel, currentPrefix }: BadgesProps) {
  return { limitedBy, currentLabel, currentPrefix };
}

export type { BadgesProps };
export { useBadges };
