export interface LoadingCardProps {
  fileName: string;
}

// The design's own five. A module constant rather than five hand-written divs.
const SKELETON_WIDTHS = [92, 78, 85, 64, 71];

export function useLoadingCard({ fileName }: LoadingCardProps) {
  return { fileName, widths: SKELETON_WIDTHS };
}
