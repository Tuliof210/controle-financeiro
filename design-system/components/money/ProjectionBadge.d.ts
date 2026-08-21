import * as React from "react";

/**
 * Marks a value as real, estimated or simulated. Accessibility-critical: the
 * three are told apart by LABEL + SHAPE/TEXTURE (solid / dotted / dashed border)
 * — never by color alone.
 *
 * @startingPoint section="Money" subtitle="real / estimado / simulado — shape, not just color" viewport="700x140"
 */
export interface ProjectionBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** real = solid border, estimado = dotted, simulado = dashed cobalt. */
  kind?: "real" | "estimado" | "simulado";
  size?: "sm" | "md";
  /** Show the leading icon. Default true. */
  showIcon?: boolean;
  /** Override label text (defaults to the kind label). */
  children?: React.ReactNode;
}

export declare function ProjectionBadge(props: ProjectionBadgeProps): React.JSX.Element;
