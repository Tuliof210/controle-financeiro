import type { ReactNode } from "react";
import { formatYTickFor } from "../../chart.config";
import type { buildFrame } from "../../chart-frame.helper";

export type ChartFrameProps = {
  // Accessible name for the plot as a whole; the marks carry their own <title>s
  // for individual data points.
  title: string;
  width: number;
  height: number;
  frame: ReturnType<typeof buildFrame>;
  // Drawn UNDER the gridlines, so a wash never covers a mark. SVG has no
  // z-index: anything passed as `children` instead would paint over the plot.
  background?: ReactNode;
  // The marks, drawn between the gridlines and the axes.
  children: ReactNode;
};

export function useChartFrame({
  title,
  width,
  height,
  frame,
  background,
  children,
}: ChartFrameProps) {
  return {
    title,
    width,
    height,
    frame,
    background,
    children,
    // Same measured width buildFrame used to pick the 12/6-month window — the
    // narrower mobile window is also where the full grouped format ("R$
    // 12.345") gets too wide for the axis gutter.
    formatYTick: formatYTickFor(width),
  };
}
