import { type ChartTagProps, useChartTag } from "./hook.ts";

// A filled label inside a plot — "PROJETADO" on the bar chart, "MÊS MAIS
// APERTADO" on the line one. Here rather than in either chart because both draw
// one: ARCHITECTURE promotes on the second consumer, and this is it.
export function ChartTag(props: ChartTagProps) {
  const { label, left, width, height, y, textX, textY, colors, labelProps } =
    useChartTag(props);

  // Not aria-hidden, and not a <g>: Biome counts both an SVG group and an SVG
  // text node as focusable and rejects the attribute on either. Left readable on
  // purpose — the tag names a REGION of the plot ("this half is projected"),
  // which no individual mark's own label says, so hiding it would drop the one
  // sentence a screen reader has for the region.
  return (
    <>
      <rect x={left} y={y} width={width} height={height} fill={colors.fill} />
      <text x={textX} y={textY} fill={colors.text} style={labelProps}>
        {label}
      </text>
    </>
  );
}
