import { BAR_RADIUS } from "../../../../chart-marks.config.ts";
import { type BarMarkProps, useBarMark } from "./hook.ts";

export function BarMark(props: BarMarkProps) {
  const { x, y, width, height, fill, shape, title, plotHeight, show, hide } =
    useBarMark(props);

  return (
    <g>
      {/* One geometry for both states: `shape` moves the two opacities, so a
          projected bar is a dashed contour around a wash and a real one is a
          solid fill whose stroke is invisible. */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={BAR_RADIUS}
        fill={fill}
        stroke={fill}
        {...shape}
      />
      {/* Invisible, full-column hit target, not the <title> this replaces — a
          near-zero bar can be a sliver a few pixels tall, and a native title
          tooltip is slow to open besides. aria-label keeps the accessible
          name. */}
      <rect
        x={x}
        y={0}
        width={width}
        height={plotHeight}
        fill="transparent"
        aria-label={title}
        onPointerEnter={show}
        onPointerMove={show}
        onPointerLeave={hide}
      />
    </g>
  );
}
