import * as React from "react";

/**
 * Signed variation with color + direction arrow for KPIs. Renders a percentage
 * (default) or a money delta in centavos. Up = positive (green), down = negative
 * (red); flip with `invert` when a decrease is good (e.g. expenses).
 */
export interface DeltaProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Variation value: percentage points (percent) or centavos (money). */
  value: number;
  /** Render as percentage. Default true. */
  percent?: boolean;
  /** Render as money (centavos); overrides percent display. */
  money?: boolean;
  /** Treat a decrease as good (e.g. spending). Default false. */
  invert?: boolean;
  /** Show direction arrow. Default true. */
  showArrow?: boolean;
  /** Magnitude treated as neutral. Default 0. */
  neutralThreshold?: number;
  size?: "sm" | "md" | "lg";
  locale?: string;
}

export declare function Delta(props: DeltaProps): React.JSX.Element;
