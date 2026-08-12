import { type DotMarkProps, useDotMark } from "./hook.ts";

// The dot is 3px; the hit target is bigger than the visible face, so landing
// near a point is as reliable as landing exactly on it.
const DOT_RADIUS = 3;
const HIT_RADIUS = 10;

export function DotMark(props: DotMarkProps) {
  const { cx, cy, title, opacity, show, hide } = useDotMark(props);

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={DOT_RADIUS}
        fill="var(--color-brand)"
        fillOpacity={opacity}
      />
      {/* Invisible hit target, not the <title> this replaces — a native title
          tooltip is slow to open and tied to the tiny visible dot. aria-label
          keeps the accessible name. */}
      <circle
        cx={cx}
        cy={cy}
        r={HIT_RADIUS}
        fill="transparent"
        aria-label={title}
        onPointerEnter={show}
        onPointerMove={show}
        onPointerLeave={hide}
      />
    </g>
  );
}
