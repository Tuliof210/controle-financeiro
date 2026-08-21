import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Monevo Button — cobalto é a única ação primária; texto sobre cobalto é branco.
   Neutros carregam secondary/ghost. Destrutivo usa vermelho semântico. */

const SIZES = {
  sm: { h: 36, px: 14, font: 14, gap: 6, icon: 16 },
  md: { h: 44, px: 18, font: 15, gap: 8, icon: 18 }, // 44 = alvo de toque mínimo
  lg: { h: 52, px: 24, font: 16, gap: 8, icon: 20 },
};

const VARIANTS = {
  primary: {
    bg: "var(--mv-primary)", color: "var(--mv-on-primary)", border: "transparent",
    hoverBg: "var(--mv-primary-hover)", activeBg: "var(--mv-primary-active)",
  },
  secondary: {
    bg: "var(--mv-surface)", color: "var(--mv-text-primary)", border: "var(--mv-border-strong)",
    hoverBg: "var(--mv-neutral-50)", activeBg: "var(--mv-neutral-100)",
  },
  ghost: {
    bg: "transparent", color: "var(--mv-text-primary)", border: "transparent",
    hoverBg: "var(--mv-neutral-100)", activeBg: "var(--mv-neutral-150)",
  },
  destructive: {
    bg: "var(--mv-negative-fg)", color: "var(--mv-white)", border: "transparent",
    hoverBg: "#B02530", activeBg: "#9A2029",
  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const isDisabled = disabled || loading;

  const bg = isDisabled ? "var(--mv-neutral-100)"
    : active ? v.activeBg : hover ? v.hoverBg : v.bg;
  const color = isDisabled ? "var(--mv-text-disabled)" : v.color;
  const border = isDisabled ? "var(--mv-border)" : v.border;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: s.gap, height: s.h, minWidth: s.h, padding: `0 ${s.px}px`,
        width: fullWidth ? "100%" : undefined,
        fontFamily: "var(--mv-font-sans)", fontSize: s.font, fontWeight: 600,
        lineHeight: 1, letterSpacing: "-0.005em",
        color, background: bg,
        border: `1px solid ${border}`, borderRadius: "var(--mv-radius-md)",
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "background var(--mv-dur-fast) var(--mv-ease-standard), transform var(--mv-dur-fast) var(--mv-ease-standard)",
        transform: active && !isDisabled ? "scale(0.985)" : "scale(1)",
        outline: "none", whiteSpace: "nowrap", userSelect: "none",
        ...style,
      }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = "var(--mv-shadow-focus)"; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
      {...rest}
    >
      {loading ? (
        <Spinner size={s.icon} color={color} />
      ) : iconLeft ? (
        <Icon name={iconLeft} size={s.icon} />
      ) : null}
      {children ? <span>{children}</span> : null}
      {!loading && iconRight ? <Icon name={iconRight} size={s.icon} /> : null}
    </button>
  );
}

function Spinner({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "mv-spin 0.7s linear infinite" }} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={color} strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <style>{"@keyframes mv-spin{to{transform:rotate(360deg)}}"}</style>
    </svg>
  );
}
