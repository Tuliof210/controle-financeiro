import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SectionCardProps = {
  title: string;
  icon?: LucideIcon;
  // Optional semantic accent for the title row (income/expense). Omitted by
  // every other caller (e.g. Settings), which keeps the neutral text color.
  tone?: "positive" | "negative";
  // Optional explanation of how the card's content is derived, revealed by an
  // info affordance in the title row. Every dashboard card sets it.
  hint?: string;
  children: ReactNode;
};

export function useSectionCard({
  title,
  icon,
  tone,
  hint,
  children,
}: SectionCardProps) {
  return { title, icon, tone, hint, children };
}
