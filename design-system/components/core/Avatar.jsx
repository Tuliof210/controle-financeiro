import React from "react";

/* Monevo Avatar — iniciais com cor derivada do nome (paleta de categorias).
   Determinístico: o mesmo nome sempre rende a mesma cor. */

const PALETTE = [
  "--mv-cat-01", "--mv-cat-02", "--mv-cat-03", "--mv-cat-04", "--mv-cat-05",
  "--mv-cat-06", "--mv-cat-07", "--mv-cat-08", "--mv-cat-09", "--mv-cat-10",
];

const SIZES = { sm: 28, md: 36, lg: 44, xl: 56 };

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function Avatar({
  name = "",
  src,
  size = "md",
  shape = "circle",
  color,
  style,
  ...rest
}) {
  const px = typeof size === "number" ? size : (SIZES[size] || SIZES.md);
  const radius = shape === "square" ? "var(--mv-radius-md)" : "var(--mv-radius-full)";
  const baseColor = color || `var(${hashColor(name)})`;

  return (
    <span
      role="img"
      aria-label={name || "Avatar"}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: px, height: px, borderRadius: radius, overflow: "hidden",
        flex: "none", userSelect: "none",
        background: src ? "var(--mv-neutral-100)" : baseColor,
        color: "var(--mv-white)",
        fontFamily: "var(--mv-font-sans)", fontWeight: 600,
        fontSize: Math.round(px * 0.40), lineHeight: 1, letterSpacing: "0.01em",
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : initials(name)}
    </span>
  );
}
