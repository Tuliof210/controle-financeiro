import * as React from "react";

/**
 * Product surface. Flat by default (border, no shadow). Use elevated only when
 * the card floats over content; sunken for nested reading areas.
 *
 * @startingPoint section="Surfaces" subtitle="Flat / elevated / sunken / outline" viewport="700x220"
 */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "flat" | "elevated" | "sunken" | "outline";
  /** Inner padding in px. Default 20. */
  padding?: number;
  /** Border radius (CSS value). Default --mv-radius-lg (14px). */
  radius?: string;
  /** Lift + shadow on hover; sets pointer cursor. */
  interactive?: boolean;
  /** Element tag to render. Default "div". */
  as?: keyof React.JSX.IntrinsicElements;
}

export declare function Card(props: CardProps): React.JSX.Element;
