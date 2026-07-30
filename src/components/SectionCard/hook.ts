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
  // Optional trailing content for the title row, pushed to its far end. Only
  // the ceiling card sets it (status badges); the other 12 call sites omit it
  // and are untouched. Here rather than in the body because the badges qualify
  // the card as a whole, not the figures under them.
  headerEnd?: ReactNode;
  children: ReactNode;
};

export function useSectionCard({
  title,
  icon,
  tone,
  hint,
  headerEnd,
  children,
}: SectionCardProps) {
  return { title, icon, tone, hint, headerEnd, children };
}
