export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

// Nothing to derive — a pass-through keeps the folder shape uniform so every
// component is read the same way.
export function usePageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return { eyebrow, title, subtitle };
}
