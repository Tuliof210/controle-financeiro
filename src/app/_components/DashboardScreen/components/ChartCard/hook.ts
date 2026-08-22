import {
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";

interface ChartCardProps {
  title: string;
  icon: MvIconName;
  hint: string;
  // Rides the card's header band at its far end, through SectionCard's existing
  // `headerEnd` slot — no new API on that component.
  legend?: ReactNode;
  // Receives the measured pixel box of the card body, so the plot can build its
  // scales. Called again whenever the card reflows.
  children: (size: { width: number; height: number }) => ReactNode;
}

const sameSize = (
  prev: { width: number; height: number },
  width: number,
  height: number,
): boolean => prev.width === width && prev.height === height;

// Returning the previous object when nothing moved keeps the state identity
// stable, so a re-measure that agrees does not re-render.
const nextSize = (
  prev: { width: number; height: number },
  width: number,
  height: number,
) => {
  if (sameSize(prev, width, height)) {
    return prev;
  }
  return { width, height };
};

function useChartCard({ title, icon, hint, legend, children }: ChartCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const { width, height } = node.getBoundingClientRect();
    // Commit only a real change, or this loops.
    setSize((prev) => nextSize(prev, width, height));
  }, []);

  // Deliberately no dependency array: re-measure after EVERY render, which
  // covers every layout change React drives. Collapsing the sidebar widens this
  // card without touching the viewport, and measuring only on mount left the
  // chart stuck at its old width. useLayoutEffect runs before paint, so the
  // first frame is correct too — safe from the SSR warning because ChartCard
  // only mounts once the client fetch resolves to status "ok".
  useLayoutEffect(measure);

  // Still observed, for resizes React never re-renders for (the window itself).
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);

  return { title, icon, hint, legend, children, ref, size };
}

export type { ChartCardProps };
export { useChartCard };
