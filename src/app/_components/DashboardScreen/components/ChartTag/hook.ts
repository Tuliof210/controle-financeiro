import {
  TAG_CHAR_PX,
  TAG_HEIGHT,
  TAG_LABEL_PROPS,
  TAG_PAD_X,
  TAG_TONES,
} from "../../chart-marks.config.ts";

interface ChartTagProps {
  // Top-left corner of the tag, in the plot's own coordinate space.
  x: number;
  y: number;
  label: string;
  tone: keyof typeof TAG_TONES;
  // Anchors the box to the RIGHT of x instead of the left, for a tag that would
  // otherwise run off the plot's trailing edge.
  flip?: boolean;
}

// A fraction of the height, matching every other label in this tree.
const BASELINE_RATIO = 0.7;

function useChartTag({ x, y, label, tone, flip }: ChartTagProps) {
  const width = label.length * TAG_CHAR_PX + TAG_PAD_X * 2;
  let left = x;
  if (flip) {
    left = x - width;
  }

  return {
    label,
    left,
    width,
    height: TAG_HEIGHT,
    y,
    // Baseline rather than centring: an SVG <text> has no box to centre in, and
    // a fraction of the height is what every other label in this tree uses.
    textY: y + TAG_HEIGHT * BASELINE_RATIO,
    textX: left + TAG_PAD_X,
    colors: TAG_TONES[tone],
    labelProps: TAG_LABEL_PROPS,
  };
}

export type { ChartTagProps };
export { useChartTag };
