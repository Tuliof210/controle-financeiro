import type { ButtonHTMLAttributes } from "react";
import styles from "./style.module.scss";

type Variant = "primary" | "ghost" | "danger" | "success" | "dashed";

export type ButtonProps = {
  variant?: Variant;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function useButton({
  variant = "primary",
  loading = false,
  className,
  type = "button",
  disabled,
  ...rest
}: ButtonProps) {
  const resolvedClassName = [
    styles.button,
    styles[variant],
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    className: resolvedClassName,
    type,
    // Working and unavailable are different states, and the pair says so:
    // aria-busy announces the work, `disabled` stops a second submit while it
    // is in flight. `disabled` is destructured out of `rest` so a caller can
    // still disable a button that is not loading, and neither can clobber the
    // other.
    disabled: Boolean(disabled) || loading,
    "aria-busy": loading,
    // `disabled` takes the button out of the tab order the instant it is
    // pressed, so aria-busy on its own announces to nobody. The live region is
    // the button itself: consumers swap the label ("Importar" → "Importando…")
    // and `polite` reads the change out. Spread rather than always-on, because
    // a live region on every button in the app would announce every label
    // change in it, forever.
    ...(loading && { "aria-live": "polite" as const }),
    ...rest,
  };
}
