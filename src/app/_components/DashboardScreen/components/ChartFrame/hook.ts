import type { ReactNode } from "react";
import type { buildFrame } from "../../chart.helper";

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
  return { title, width, height, frame, children };
}
