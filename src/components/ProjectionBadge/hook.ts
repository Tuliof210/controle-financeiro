import type { ReactNode } from "react";
import type { MvIconName } from "@/components/Icon/hook.ts";
import { cx } from "@/lib/cx.ts";
import styles from "./style.module.scss";

export type ProjectionKind = "real" | "estimado" | "simulado";

export type ProjectionBadgeProps = {
  kind?: ProjectionKind;
  size?: "sm" | "md";
  showIcon?: boolean;
  children?: ReactNode;
};

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

export function useProjectionBadge({
  kind = "real",
  size = "md",
  showIcon = true,
  children,
}: ProjectionBadgeProps) {
  return {
    className: cx(styles.badge, styles[kind], styles[size]),
    icon: showIcon ? ICONS[kind] : undefined,
    iconSize: size === "sm" ? 12 : 14,
    label: children ?? COPY[kind],
  };
}
