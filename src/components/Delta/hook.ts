import type { HTMLAttributes } from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";
import { cx } from "@/lib/cx.ts";
import {
  arrowOf,
  iconSizeOf,
  isGood,
  percentLabel,
  toneOf,
} from "./delta.helper.ts";
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
  const tone = toneOf(up, down, isGood(invert, up, down));
  let arrow: MvIconName | undefined;
  if (showArrow) {
    arrow = arrowOf(up, down);
  }
  let label: string | undefined;
  if (!money && percent) {
    label = percentLabel(value, up, down);
  }

  return {
    deltaProps: {
      className: cx(styles.delta, styles[size], styles[tone], className),
      role: "status" as const,
      ...rest,
    },
    arrow,
    iconSize: iconSizeOf(size),
    money,
    value,
    label,
  };
}
