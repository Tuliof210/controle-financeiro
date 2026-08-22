import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx.ts";
import styles from "./style.module.scss";

type Variant = "flat" | "elevated" | "sunken" | "outline";
type Padding = "sm" | "md" | "lg";

export type CardProps = {
  variant?: Variant;
  padding?: Padding;
  interactive?: boolean;
  as?: keyof JSX.IntrinsicElements;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

export function useCard({
  variant = "flat",
  padding = "md",
  interactive = false,
  as: tag = "div",
  className,
  children,
  ...rest
}: CardProps) {
  return {
    tag,
    cardProps: {
      className: cx(
        styles.card,
        styles[variant],
        styles[padding],
        interactive && styles.interactive,
        className,
      ),
      ...rest,
    },
    children,
  };
}
