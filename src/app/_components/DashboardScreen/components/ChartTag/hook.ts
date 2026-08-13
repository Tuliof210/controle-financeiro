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
  // The plot's inner width. The tag decides for itself which side of `x` to hang
  // on and clamps into the plot: a caller cannot know, because only the tag knows
  // how wide its own label is.
  plotWidth: number;
}

// A fraction of the height, matching every other label in this tree.
const BASELINE_RATIO = 0.7;

// Which side of `x` the box hangs on, and where it ends up.
//
// It used to flip past the plot's MIDPOINT, decided by the caller. Two ways that
// clipped: `PROJETADO` is ~97px, so when only the last month or two is projected
// there was about one band of room right of `band.x` and the SVG root cut the word
// in half; and on the line chart a flip between roughly 111 and 178px produced a
// NEGATIVE left, clipping on the other side instead.
//
// Now: hang right of `x` while there is room for the whole box, otherwise hang
// left of it — and clamp either way, so a plot narrower than the label still
// shows the label's start rather than its middle.
function placeBox(x: number, width: number, plotWidth: number): number {
  let left = x;
  if (x + width > plotWidth) {
    left = x - width;
  }
  return Math.max(0, Math.min(left, Math.max(0, plotWidth - width)));
}

function useChartTag({ x, y, label, tone, plotWidth }: ChartTagProps) {
  const width = label.length * TAG_CHAR_PX + TAG_PAD_X * 2;
  const left = placeBox(x, width, plotWidth);

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
