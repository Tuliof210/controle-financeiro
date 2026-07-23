import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./style.module.scss";

type Variant = "ghost" | "danger";

// `aria-label` is required: an icon-only button has no text label, so it must
// carry an accessible name.
export type IconButtonProps = {
  variant?: Variant;
  "aria-label": string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function useIconButton({
  variant = "ghost",
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  const resolvedClassName = [styles.iconButton, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return { className: resolvedClassName, type, ...rest };
}
