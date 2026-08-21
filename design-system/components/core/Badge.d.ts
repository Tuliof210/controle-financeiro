import * as React from "react";
import type { MvIconName } from "./Icon";

/**
 * Pill/badge for status, category, profile scope and the "principal" marker.
 * Color reinforces meaning but is never the only signal (icon/label carry it).
 *
 * @startingPoint section="Data display" subtitle="Status, scope (PF/PJ) and principal pills" viewport="700x160"
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone — financial state only. Default "neutral". */
  tone?: "neutral" | "positive" | "negative" | "alert" | "info" | "ai" | "cobalt";
  /** Fill style. Default "soft". */
  variant?: "soft" | "solid" | "outline";
  size?: "sm" | "md";
  /** Leading icon from the Monevo set. */
  icon?: MvIconName;
  /** Leading status dot instead of an icon. */
  dot?: boolean;
  /** Profile scope pill: "PF" | "PJ" | custom — overrides tone with a scope treatment. */
  scope?: "PF" | "PJ" | string;
  /** Render the cobalt "principal" marker (overrides tone). */
  principal?: boolean;
}

export declare function Badge(props: BadgeProps): React.JSX.Element;
