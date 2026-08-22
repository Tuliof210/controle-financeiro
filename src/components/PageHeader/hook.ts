export interface PageHeaderProps {
  title: string;
  subtitle: string;
}

// Nothing to derive — a pass-through keeps the folder shape uniform so every
// component is read the same way.
export function usePageHeader({ title, subtitle }: PageHeaderProps) {
  return { title, subtitle };
}
