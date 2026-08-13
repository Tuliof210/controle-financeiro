import { type DotMarkProps, useDotMark } from "./hook.ts";

// The dot is 4px; the hit target is bigger than the visible face, so landing
// near a point is as reliable as landing exactly on it.
//
// 12, not the old 10: WCAG 2.2 SC 2.5.8 asks for 24x24, and a radius of 10 gave a
// 20px target.
const DOT_RADIUS = 4;
const HIT_RADIUS = 12;

export function DotMark(props: DotMarkProps) {
  const { cx, cy, label, opacity, dash, show, focus, hide } = useDotMark(props);

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
        stroke="var(--cat-cyan)"
        strokeWidth={2}
        strokeOpacity={opacity}
        strokeDasharray={dash}
      />
      {/* Focusable, with a role, and reachable by keyboard — it used to answer
          pointer events only, so the per-month figures (which exist nowhere else
          on this screen) could not be read without a mouse. On touch,
          pointerenter/leave bracket finger-down, so the bubble only lived while
          held; focus gives touch a persistent path too. */}
      {/* biome-ignore lint/a11y/useSemanticElements: there is no <button> inside
          SVG — the same escape hatch CapSelector's comment grants ColorPicker,
          for the same reason: the semantic element cannot draw this. */}
      <circle
        cx={cx}
        cy={cy}
        r={HIT_RADIUS}
        fill="transparent"
        role="button"
        tabIndex={0}
        aria-label={label}
        onPointerEnter={show}
        onPointerMove={show}
        onPointerLeave={hide}
        onFocus={focus}
        onBlur={hide}
      />
    </g>
  );
}
