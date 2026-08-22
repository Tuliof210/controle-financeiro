import type { ReactNode } from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";
import { cx } from "@/lib/cx.ts";
import styles from "./style.module.scss";

type ProjectionKind = "real" | "estimado" | "simulado";
type Size = "sm" | "md";

const ICON_SM = 12;
const ICON_MD = 14;

const COPY: Record<ProjectionKind, string> = {
  real: "Real",
  estimado: "Estimado",
  simulado: "Simulado",
};

const ICONS: Record<ProjectionKind, MvIconName> = {
  real: "check",
  estimado: "calendar",
  simulado: "sparkles",
};

function iconOf(
  showIcon: boolean,
  kind: ProjectionKind,
): MvIconName | undefined {
  if (!showIcon) {
    return;
  }
  return ICONS[kind];
}

function iconSizeOf(size: Size): number {
  if (size === "sm") {
    return ICON_SM;
  }
  return ICON_MD;
}

export type { ProjectionKind };

export interface ProjectionBadgeProps {
  kind?: ProjectionKind;
  size?: Size;
  showIcon?: boolean;
  children?: ReactNode;
}

export function useProjectionBadge({
  kind = "real",
  size = "md",
  showIcon = true,
  children,
}: ProjectionBadgeProps) {
  return {
    className: cx(styles.badge, styles[kind], styles[size]),
    icon: iconOf(showIcon, kind),
    iconSize: iconSizeOf(size),
    label: children ?? COPY[kind],
  };
}
