import type { TooltipState } from "./hook";
import styles from "./style.module.scss";

export function ChartTooltip({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip) return null;

  return (
    <div
      className={styles.bubble}
      style={{ left: tooltip.x, top: tooltip.y }}
      role="tooltip"
    >
      {tooltip.text}
    </div>
  );
}
