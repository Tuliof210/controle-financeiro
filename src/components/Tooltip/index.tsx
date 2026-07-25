import { Info } from "lucide-react";
import { type TooltipProps, useTooltip } from "./hook";
import styles from "./style.module.scss";

export function Tooltip(props: TooltipProps) {
  const { text, id, onKeyDown } = useTooltip(props);

  return (
    <span className={styles.wrapper}>
      {/* A real <button>: the hint has to be reachable by Tab, and a button is
          focusable and announced as interactive without an explicit tabIndex.
          Not IconButton — that carries variant styling and a row-action hit
          area that would need overriding on every axis. */}
      <button
        type="button"
        className={styles.trigger}
        aria-label="Como este número é calculado"
        aria-describedby={id}
        onKeyDown={onKeyDown}
      >
        <Info size={14} aria-hidden />
      </button>
      {/* Always in the DOM (hidden via opacity/visibility, never unmounted) so
          aria-describedby always resolves to a real element. */}
      <span role="tooltip" id={id} className={styles.bubble}>
        {text}
      </span>
    </span>
  );
}
