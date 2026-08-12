import { type BarMarkProps, useBarMark } from "./hook.ts";

export function BarMark(props: BarMarkProps) {
  const { x, y, width, height, fill, opacity, title, plotHeight, show, hide } =
    useBarMark(props);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={opacity}
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
