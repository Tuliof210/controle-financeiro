import * as React from "react";

export type MvIconName =
  | "wallet" | "card" | "target" | "trendingUp" | "trendingDown"
  | "arrowUpRight" | "arrowDownRight" | "plus" | "minus" | "repeat"
  | "calendar" | "alertTriangle" | "sparkles" | "eye" | "lock"
  | "check" | "x" | "chevronDown" | "chevronRight" | "archive"
  | "search" | "settings" | "bell" | "user" | "building"
  | "pieChart" | "banknote";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Icon name from the Monevo single-stroke set. */
  name: MvIconName;
  /** Pixel size (width = height). Default 20. */
  size?: number;
  /** Stroke width on the 24px grid. Default 1.75. */
  strokeWidth?: number;
  /** Stroke color. Default currentColor. */
  color?: string;
  /** Accessible label; when set the icon is exposed to AT, otherwise hidden. */
  title?: string;
}

/** Single-stroke domain icon. Never draw inline SVG outside this set. */
export declare function Icon(props: IconProps): React.JSX.Element;

export declare const MV_ICONS: Record<MvIconName, string>;
