import { Icon } from "@/components/Icon/index.tsx";
import { type ProjectionBadgeProps, useProjectionBadge } from "./hook.ts";

export function ProjectionBadge(props: ProjectionBadgeProps) {
  const { className, icon, iconSize, label } = useProjectionBadge(props);

  return (
    <span className={className}>
      {icon !== undefined && <Icon name={icon} size={iconSize} />}
      {label}
    </span>
  );
}
