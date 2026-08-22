import type { SVGProps } from "react";
import { MV_ICONS, type MvIconName } from "./icons.ts";
import styles from "./style.module.scss";

function roleFor(title: string | undefined) {
  if (title) {
    return "img" as const;
  }
  return "presentation" as const;
}

function hiddenFor(title: string | undefined) {
  if (title) {
    return;
  }
  return true;
}

export type { MvIconName } from "./icons.ts";

export type IconProps = {
  name: MvIconName;
  size?: number;
  strokeWidth?: number;
  title?: string;
} & SVGProps<SVGSVGElement>;

export function useIcon({
  name,
  size = 20,
  strokeWidth = 1.75,
  title,
  className,
  color = "currentColor",
  ...rest
}: IconProps) {
  return {
    svg: {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none" as const,
      stroke: color,
      strokeWidth,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      role: roleFor(title),
      "aria-hidden": hiddenFor(title),
      "aria-label": title,
      className: [styles.icon, className].filter(Boolean).join(" "),
      ...rest,
    },
    d: MV_ICONS[name],
    caption: title ?? name,
  };
}
