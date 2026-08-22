import type { HTMLAttributes } from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";
import { cx } from "@/lib/cx.ts";
import styles from "./style.module.scss";

export type DeltaProps = {
  value: number;
  percent?: boolean;
  money?: boolean;
  invert?: boolean;
  showArrow?: boolean;
  neutralThreshold?: number;
  size?: "sm" | "md" | "lg";
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

function arrowOf(up: boolean, down: boolean): MvIconName | undefined {
  if (up) {
    return "trendingUp";
  }
  if (down) {
    return "trendingDown";
  }
  return undefined;
}

function percentLabel(value: number, up: boolean, down: boolean): string {
  const abs = Math.abs(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  if (up) {
    return `+${abs}%`;
  }
  if (down) {
    return `−${abs}%`;
  }
  return `${abs}%`;
}

export function useDelta({
  value,
  percent = true,
  money = false,
  invert = false,
  showArrow = true,
  neutralThreshold = 0,
  size = "md",
  className,
  ...rest
}: DeltaProps) {
  const up = value > neutralThreshold;
  const down = value < -neutralThreshold;
  const good = invert ? down : up;
  const tone = !up && !down ? "muted" : good ? "positive" : "negative";

  return {
    deltaProps: {
      className: cx(styles.delta, styles[size], styles[tone], className),
      role: "status" as const,
      ...rest,
    },
    arrow: showArrow ? arrowOf(up, down) : undefined,
    iconSize: size === "sm" ? 12 : size === "lg" ? 16 : 14,
    money,
    value,
    label: money || !percent ? undefined : percentLabel(value, up, down),
  };
}
