import {
  TAG_TONES,
  TIGHTEST_RULE_DASHARRAY,
} from "../../../../chart.config.ts";
import { ChartTag } from "../../../ChartTag/index.tsx";
import { type TightestMarkProps, useTightestMark } from "./hook.ts";

// The month the Teto card names as its bottleneck: a dashed drop from the point
// to the axis, and a filled tag above it. Its own folder because the chart's
// index.tsx crossed the 100-line cap holding it inline — the marks around it
// (the two LinePaths, the dots) are the chart's own, this one is a caption.
//
// Rendered as a CHILD of ChartFrame, never through its `background` slot: that
// slot draws under the gridlines, which is right for a wash and wrong for an
// opaque label.
export function TightestMark(props: TightestMarkProps) {
  const { x, y, height, flip, tagY } = useTightestMark(props);

  return (
    <g>
      <line
        x1={x}
        x2={x}
        y1={y}
        y2={height}
        stroke={TAG_TONES.caution.fill}
        strokeWidth={2}
        strokeDasharray={TIGHTEST_RULE_DASHARRAY}
      />
      <ChartTag
        x={x}
        y={tagY}
        label="MÊS MAIS APERTADO"
        tone="caution"
        flip={flip}
      />
    </g>
  );
}
