import type { ReactNode } from "react";

export interface StatusLineProps {
  children: ReactNode;
}

export function useStatusLine({ children }: StatusLineProps) {
  return { children };
}
