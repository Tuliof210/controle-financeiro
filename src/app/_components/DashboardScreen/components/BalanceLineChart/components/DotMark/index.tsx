import { type DotMarkProps, useDotMark } from "./hook.ts";

// The dot is 4px; the hit target is bigger than the visible face, so landing
// near a point is as reliable as landing exactly on it.
const DOT_RADIUS = 4;
const HIT_RADIUS = 10;

export function DotMark(props: DotMarkProps) {
  const { cx, cy, title, opacity, show, hide } = useDotMark(props);

  return (
    <g>
      {/* Hollow, like the target's: the surface fill punches the dot out of the
          line it sits on, so a run of points stays countable where the curve is
          steep and two of them nearly touch. */}
      <circle
        cx={cx}
        cy={cy}
        r={DOT_RADIUS}
        fill="var(--color-surface)"
        stroke="var(--color-brand)"
        strokeWidth={2}
        strokeOpacity={opacity}
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
