import * as React from "react";

/** Initials avatar with a deterministic color derived from the name. */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Full name; first+last initials shown, drives the derived color. */
  name?: string;
  /** Optional image URL; replaces initials. */
  src?: string;
  /** Preset size or px number. Default "md" (36px). */
  size?: "sm" | "md" | "lg" | "xl" | number;
  shape?: "circle" | "square";
  /** Override the derived background color (CSS value). */
  color?: string;
}

export declare function Avatar(props: AvatarProps): React.JSX.Element;
