import type { TooltipState } from "./chart-tooltip.types.ts";
import { useChartTooltipBubble } from "./hook.ts";
import styles from "./style.module.scss";

// Kept as HTML rather than moved into the plot as the target's <rect> pair, for
// three reasons, in order of weight:
//   1. ChartFrame's scroll box is `overflow-x: auto`. A bubble drawn inside that
//      <svg> is clipped by it and scrolls away with the plot; this one is
//      `position: fixed` off the pointer and escapes the box.
//   2. The target's shadow is `rgba(20,23,28,0.07)` — the ONE hardcoded colour
//      in the whole file, and rule 1 forbids it here. As HTML the bubble gets
//      t.elevation(overlay) from the token layer, themed, for free.
//   3. An SVG <text> has no box, so its width has to be hand-measured per
//      character — the exact hazard chart-marks.config.ts already documents
//      TAG_CHAR_PX having caused. HTML sizes itself.
//
// `aria-hidden`, and no `role="tooltip"`. That role was orphaned: nothing pointed
// at this element, so its three rows were announced to nobody at all. The same
// words now ride the MARK's own accessible name (mark-label.helper.ts), where a
// keyboard reader actually lands — which also means this is purely visual and
// must not be read twice.
export function ChartTooltip({ tooltip }: { tooltip: TooltipState }) {
  const { bubble } = useChartTooltipBubble({ tooltip });

  if (bubble === null) {
    return null;
  }

  return (
    <div
      className={styles.bubble}
      style={{ left: bubble.x, top: bubble.y }}
      aria-hidden={true}
    >
      <p className={styles.head}>
        <span className={styles.title}>{bubble.title}</span>
        {/* The word, not the colour: this is what says "projection" when the
            chart is read in greyscale. */}
        <span className={styles.tag}>{bubble.tag}</span>
      </p>
      <dl className={styles.rows}>
        {bubble.rows.map((row) => (
          <div className={styles.row} key={row.key}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={row.className}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
