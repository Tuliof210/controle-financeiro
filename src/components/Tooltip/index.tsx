import { Icon } from "@/components/Icon/index.tsx";
import { type TooltipProps, useTooltip } from "./hook.ts";
import styles from "./style.module.scss";

export function Tooltip(props: TooltipProps) {
  const { text, label, id, dismissed, onKeyDown, rearm } = useTooltip(props);

  return (
    <span
      className={styles.wrapper}
      data-dismissed={dismissed || undefined}
      onPointerEnter={rearm}
    >
      {/* A real <button>: the hint has to be reachable by Tab, and a button is
          focusable and announced as interactive without an explicit tabIndex.
          Not IconButton — that carries variant styling and a row-action hit
          area that would need overriding on every axis. */}
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-describedby={id}
        onKeyDown={onKeyDown}
        onBlur={rearm}
      >
        <Icon name="info" size={14} />
      </button>
      {/* Always in the DOM (hidden via opacity/visibility, never unmounted) so
          aria-describedby always resolves to a real element. */}
      <span role="tooltip" id={id} className={styles.bubble}>
        {text}
      </span>
    </span>
  );
}
