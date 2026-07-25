import type { LucideIcon } from "lucide-react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

export type ChartCardProps = {
  title: string;
  icon: LucideIcon;
  hint: string;
  // Receives the measured pixel box of the card body, so the plot can build its
  // scales. Called again whenever the card reflows.
  children: (size: { width: number; height: number }) => ReactNode;
};

const SAME = (a: DOMRect, b: { width: number; height: number }) =>
  a.width === b.width && a.height === b.height;

export function useChartCard({ title, icon, hint, children }: ChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // useLayoutEffect, not useEffect: it measures before paint, so the chart is
  // there on the first frame instead of flashing an empty box. Safe from the
  // SSR warning because ChartCard only mounts after the client-side fetch
  // resolves to status "ok" — it never renders on the server.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const measure = () => {
      const box = node.getBoundingClientRect();
      setSize((prev) =>
        SAME(box, prev) ? prev : { width: box.width, height: box.height },
      );
    };

    // Measure once outright rather than relying on ResizeObserver's initial
    // callback, so the first render does not depend on observer delivery.
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { title, icon, hint, children, ref, size };
}
