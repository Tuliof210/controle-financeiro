import { colorOf } from "./color.helper.ts";
import { initialsOf } from "./initials.helper.ts";
import styles from "./style.module.scss";

const SIZE_PX = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56,
} as const;

const FONT_RATIO = 0.4;

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl" | number;
  shape?: "circle" | "square";
  color?: string;
}

function pixelSize(size: AvatarProps["size"]): number {
  if (typeof size === "number") {
    return size;
  }
  return SIZE_PX[size ?? "md"];
}

export function useAvatar({
  name,
  src,
  size = "md",
  shape = "circle",
  color,
}: AvatarProps) {
  const px = pixelSize(size);
  let radiusClass = styles.circle;
  if (shape === "square") {
    radiusClass = styles.square;
  }

  let background = color ?? colorOf(name ?? "");
  if (src !== undefined) {
    background = "var(--color-surface-raised)";
  }

  let label: string | undefined;
  if (name !== undefined && name !== "") {
    label = name;
  }

  return {
    className: [styles.avatar, radiusClass].join(" "),
    style: {
      width: px,
      height: px,
      background,
      fontSize: Math.round(px * FONT_RATIO),
    },
    imageClass: styles.image,
    src,
    initials: initialsOf(name ?? ""),
    alt: name ?? "",
    label,
  };
}

export type { AvatarProps };
