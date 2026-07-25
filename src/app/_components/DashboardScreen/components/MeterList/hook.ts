import type { ReactNode } from "react";

export type MeterListProps = { children: ReactNode };

export function useMeterList({ children }: MeterListProps) {
  return { children };
}
