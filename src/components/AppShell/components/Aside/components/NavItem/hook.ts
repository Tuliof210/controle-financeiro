type UseNavItemProps = {
  href: string;
  label: string;
  active: boolean;
};

export function useNavItem({ href, label, active }: UseNavItemProps) {
  return { href, label, active };
}
