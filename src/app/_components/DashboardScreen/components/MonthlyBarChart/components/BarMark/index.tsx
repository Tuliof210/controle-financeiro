import { BAR_RADIUS } from "../../../../chart-marks.config.ts";
import { type BarMarkProps, useBarMark } from "./hook.ts";

export function BarMark(props: BarMarkProps) {
  const {
    x,
    y,
    width,
    height,
    fill,
    shape,
    label,
    plotHeight,
    show,
    focus,
    hide,
  } = useBarMark(props);

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
      {/* Invisible, full-column hit target: a near-zero bar can be a sliver a
          few pixels tall. Focusable, with a role, and reachable by keyboard — it
          used to answer pointer events only, so entradas and saídas per month
          could not be read without a mouse at all. On touch,
          pointerenter/pointerleave bracket finger-down, so the bubble lived only
          while held; focus gives touch a persistent path too. */}
      {/* biome-ignore lint/a11y/useSemanticElements: there is no <button> inside
          SVG — the same escape hatch CapSelector's comment grants ColorPicker,
          for the same reason: the semantic element cannot draw this. */}
      <rect
        x={x}
        y={0}
        width={width}
        height={plotHeight}
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
