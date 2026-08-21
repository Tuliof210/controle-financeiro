import * as React from "react";
import type { MvIconName } from "../core/Icon";

/**
 * Primary action button. Cobalt is the ONLY primary action color and text on
 * cobalt is always white. Use sparingly — one primary action per view.
 *
 * @startingPoint section="Forms" subtitle="Cobalt primary + secondary/ghost/destructive" viewport="700x180"
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  /** Visual intent. Default "primary". */
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  /** Size. md (44px) meets the mobile tap target. Default "md". */
  size?: "sm" | "md" | "lg";
  /** Leading icon name from the Monevo icon set. */
  iconLeft?: MvIconName;
  /** Trailing icon name from the Monevo icon set. */
  iconRight?: MvIconName;
  /** Stretch to container width (default for primary actions on mobile). */
  fullWidth?: boolean;
  /** Show spinner and block interaction. */
  loading?: boolean;
  style?: React.CSSProperties;
}

export declare function Button(props: ButtonProps): React.JSX.Element;
