import type { LucideIcon } from "lucide-react";

type UseNavItemProps = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
};

export function useNavItem({ href, label, active, icon }: UseNavItemProps) {
  return { href, label, active, icon };
}
