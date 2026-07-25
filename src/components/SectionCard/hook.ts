import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SectionCardProps = {
  title: string;
  icon?: LucideIcon;
  // Optional semantic accent for the title row (income/expense). Omitted by
  // every other caller (e.g. Settings), which keeps the neutral text color.
  tone?: "positive" | "negative";
  children: ReactNode;
};

export function useSectionCard({
  title,
  icon,
  tone,
  children,
}: SectionCardProps) {
  return { title, icon, tone, children };
}
