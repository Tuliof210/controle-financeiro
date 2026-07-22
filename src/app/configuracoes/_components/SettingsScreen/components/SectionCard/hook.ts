import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SectionCardProps = {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
};

export function useSectionCard({ title, icon, children }: SectionCardProps) {
  return { title, icon, children };
}
