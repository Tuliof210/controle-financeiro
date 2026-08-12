interface LoadingCardProps {
  fileName: string;
}

// The design's own five. A module constant rather than five hand-written divs.
// The design's own five skeleton bar widths, in percent of the card.
const WIDE = 92;
const MEDIUM_WIDE = 85;
const MEDIUM = 78;
const NARROW = 71;
const NARROWEST = 64;
const SKELETON_WIDTHS = [WIDE, MEDIUM, MEDIUM_WIDE, NARROWEST, NARROW];

function useLoadingCard({ fileName }: LoadingCardProps) {
  return { fileName, widths: SKELETON_WIDTHS };
}

export type { LoadingCardProps };
export { useLoadingCard };
