import { TAG_HEIGHT } from "../../../../chart-marks.config.ts";

export interface TightestMarkProps {
  // Where the marked month sits in the plot, and its own cumulative — not the
  // curve's minimum. The two need not coincide: this names the month the Teto
  // card calls its bottleneck.
  x: number;
  y: number;
  // Plot height, so the rule can drop from the point to the axis.
  height: number;
  // Plot width, passed straight through to the tag. `flip` used to be decided
  // here from the plot's midpoint, which clipped the label at both ends; the tag
  // now places itself, because only it knows how wide its own label is.
  width: number;
}

export function useTightestMark({ x, y, height, width }: TightestMarkProps) {
  return {
    x,
    y,
    height,
    width,
    // Two tag-heights clear of the point, floored at the plot's top edge.
    tagY: Math.max(0, y - TAG_HEIGHT * 2),
  };
}
