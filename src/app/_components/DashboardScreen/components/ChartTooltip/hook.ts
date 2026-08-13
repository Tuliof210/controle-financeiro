import { useCallback, useEffect, useState } from "react";
import { cx } from "@/lib/cx.ts";
import type {
  PointerLocation,
  TooltipContent,
  TooltipState,
  TooltipTone,
} from "./chart-tooltip.types.ts";
import styles from "./style.module.scss";

// An explicit map, not `styles[tone]`: a CSS-Modules string lookup dies silently
// when a class is renamed, and nothing in the suite would catch it.
const TONE_CLASS: Record<TooltipTone, string | undefined> = {
  positive: styles.positive,
  negative: styles.negative,
  brand: styles.brand,
  neutral: undefined,
};

// Called from the chart's OWN hook (BalanceLineChart/hook.ts,
// MonthlyBarChart/hook.ts) — never from a view. The trigger (a dot or bar) and
// the bubble that renders it are siblings, not parent/child, so the state lives
// here and gets threaded down as props.
//
// The two callbacks are useCallback'd because every mark holds a reference to
// them: recreated each render they would defeat any React.memo on the marks,
// which is the only reason to memoize the marks at all.
export function useChartTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const showTooltip = useCallback(
    (event: PointerLocation, content: TooltipContent) =>
      setTooltip({ x: event.clientX, y: event.clientY, ...content }),
    [],
  );

  const hideTooltip = useCallback(() => setTooltip(null), []);

  // WCAG 1.4.13 Dismissible: content shown on hover or focus has to be
  // dismissable without moving the pointer or the focus. Bound to the window
  // rather than to a mark, because the pointer case has no focused element to
  // hang a handler on.
  useEffect(() => {
    if (tooltip === null) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTooltip(null);
      }
    };
    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, [tooltip]);

  return { tooltip, showTooltip, hideTooltip };
}

// The bubble's own hook, so `index.tsx` is a view that blindly renders what it is
// given — ARCHITECTURE.md's three-file rule, which this folder broke in both
// directions: the state hook was called from two parent VIEWS, and the view held
// the tone map and the null guard itself.
export function useChartTooltipBubble({ tooltip }: { tooltip: TooltipState }) {
  if (tooltip === null) {
    return { bubble: null };
  }

  return {
    bubble: {
      x: tooltip.x,
      y: tooltip.y,
      title: tooltip.title,
      tag: tooltip.tag,
      rows: tooltip.rows.map((row) => ({
        key: row.key,
        label: row.label,
        value: row.value,
        className: cx(styles.value, TONE_CLASS[row.tone]),
      })),
    },
  };
}
