import type { HTMLAttributes, ReactNode } from "react";
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

const ICON_SM = 12;
const ICON_MD = 14;

function iconSizeOf(size: Size): number {
  if (size === "sm") {
    return ICON_SM;
  }
  return ICON_MD;
}

export type BadgeProps = {
  tone?: Tone;
  variant?: Variant;
  size?: Size;
  icon?: MvIconName;
  dot?: boolean;
  scope?: "PF" | "PJ" | string;
  principal?: boolean;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

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
    iconSize: iconSizeOf(size),
    dot,
    children,
  };
}
