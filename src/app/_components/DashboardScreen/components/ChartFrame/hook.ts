import type { ReactNode } from "react";
import { formatMoneyShort, formatMoneyShortK } from "@/lib/money";
import { isDesktopWidth } from "../../chart.config";
import type { buildFrame } from "../../chart-frame.helper";

export type ChartFrameProps = {
  // Accessible name for the plot as a whole; the marks carry their own <title>s
  // for individual data points.
  title: string;
  width: number;
  height: number;
  frame: ReturnType<typeof buildFrame>;
  // The marks, drawn between the gridlines and the axes.
  children: ReactNode;
};

export function useChartFrame({
  title,
  width,
  height,
  frame,
  children,
}: ChartFrameProps) {
  return {
    title,
    width,
    height,
    frame,
    children,
    // Same measured width buildFrame used to pick the 12/6-month window — the
    // narrower mobile window is also where the full grouped format ("R$
    // 12.345") gets too wide for the axis gutter.
    formatYTick: isDesktopWidth(width) ? formatMoneyShort : formatMoneyShortK,
  };
}
