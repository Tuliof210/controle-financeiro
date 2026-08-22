import type { ReactNode } from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";
import { cx } from "@/lib/cx.ts";
import styles from "./style.module.scss";

type Tone =
  | "neutral"
  | "positive"
  | "negative"
  | "alert"
  | "info"
  | "ai"
  | "cobalt";
type Variant = "soft" | "solid" | "outline";
type Size = "sm" | "md";

export type BadgeProps = {
  tone?: Tone;
  variant?: Variant;
  size?: Size;
  icon?: MvIconName;
  dot?: boolean;
  scope?: "PF" | "PJ" | string;
  principal?: boolean;
  children: ReactNode;
};

export function useBadge({
  tone = "neutral",
  variant = "soft",
  size = "md",
  icon,
  dot = false,
  children,
}: BadgeProps) {
  return {
    className: cx(styles.badge, styles[tone], styles[variant], styles[size]),
    icon,
    iconSize: size === "sm" ? 12 : 14,
    dot,
    children,
  };
}
