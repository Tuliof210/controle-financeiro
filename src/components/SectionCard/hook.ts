import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// The fill of an optional header band. `brand` and `ink` name the card's role,
// not a token: `_band.scss` records which fill each one resolves to and the
// contrast ratio that decided it.
export type BandTone = "positive" | "negative" | "brand" | "ink";

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
  // Optional filled header band: the title row becomes a solid strip spanning
  // the card's full width, and the card gains the hard offset shadow README
  // rule 3 scopes to it. Only the dashboard board sets it; the 8 call sites
  // outside it omit it and render exactly as before.
  band?: BandTone;
  children: ReactNode;
};

export function useSectionCard({
  title,
  icon,
  tone,
  hint,
  headerEnd,
  band,
  children,
}: SectionCardProps) {
  return { title, icon, tone, hint, headerEnd, band, children };
}
