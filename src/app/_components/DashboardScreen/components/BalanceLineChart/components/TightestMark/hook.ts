import { TAG_HEIGHT } from "../../../../chart.config";

export type TightestMarkProps = {
  // Where the marked month sits in the plot, and its own cumulative — not the
  // curve's minimum. The two need not coincide: this names the month the Teto
  // card calls its bottleneck.
  x: number;
  y: number;
  // Plot height, so the rule can drop from the point to the axis.
  height: number;
  // Past the plot's midpoint the tag hangs left of its rule instead of right,
  // or it would run off the trailing edge.
  flip: boolean;
};

export function useTightestMark({ x, y, height, flip }: TightestMarkProps) {
  return {
    x,
    y,
    height,
    flip,
    // Two tag-heights clear of the point, floored at the plot's top edge.
    tagY: Math.max(0, y - TAG_HEIGHT * 2),
  };
}
