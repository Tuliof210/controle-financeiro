import type { ButtonHTMLAttributes } from "react";
import styles from "./style.module.scss";

type Variant = "primary" | "ghost" | "danger" | "success" | "dashed";

export type ButtonProps = {
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function useButton({
  variant = "primary",
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const resolvedClassName = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(" ");

  return { className: resolvedClassName, type, ...rest };
}
