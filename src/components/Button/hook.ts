import type { ButtonHTMLAttributes } from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";
import styles from "./style.module.scss";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "dashed";
type Size = "sm" | "md" | "lg";

function iconsWhileBusy(
  loading: boolean,
  icon: MvIconName | undefined,
): MvIconName | undefined {
  if (loading) {
    return;
  }
  return icon;
}

export type ButtonProps = {
  variant?: Variant;
  size?: Size;
  iconLeft?: MvIconName;
  iconRight?: MvIconName;
  fullWidth?: boolean;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function useButton({
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  className,
  type = "button",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const resolvedClassName = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.full,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    buttonProps: {
      className: resolvedClassName,
      type,
      disabled: Boolean(disabled) || loading,
      "aria-busy": loading,
      ...(loading && { "aria-live": "polite" as const }),
      ...rest,
    },
    iconLeft: iconsWhileBusy(loading, iconLeft),
    iconRight: iconsWhileBusy(loading, iconRight),
    children,
  };
}
