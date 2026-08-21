import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Monevo ProjectionBadge — distingue REAL / ESTIMADO / SIMULADO.
   Crítico (a11y): a diferença é RÓTULO + FORMA/TEXTURA, nunca só cor.
   - real:     contorno SÓLIDO, fundo neutro, ícone check
   - estimado: contorno PONTILHADO, ícone calendário
   - simulado: contorno TRACEJADO cobalt, ícone sparkles/alvo */

const KINDS = {
  real: {
    label: "Real", icon: "check",
    fg: "var(--mv-proj-real-fg)", bg: "var(--mv-proj-real-bg)",
    border: "1px solid var(--mv-neutral-300)",
  },
  estimado: {
    label: "Estimado", icon: "calendar",
    fg: "var(--mv-proj-est-fg)", bg: "var(--mv-proj-est-bg)",
    border: "1.5px dotted var(--mv-neutral-400)",
  },
  simulado: {
    label: "Simulado", icon: "sparkles",
    fg: "var(--mv-proj-sim-fg)", bg: "var(--mv-proj-sim-bg)",
    border: "1.5px dashed var(--mv-cobalt-300)",
  },
};

const SIZES = {
  sm: { h: 22, px: 8, font: 11, icon: 12, gap: 4 },
  md: { h: 28, px: 11, font: 12, icon: 14, gap: 5 },
};

export function ProjectionBadge({
  kind = "real",
  children,
  size = "md",
  showIcon = true,
  style,
  ...rest
}) {
  const k = KINDS[kind] || KINDS.real;
  const s = SIZES[size] || SIZES.md;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: s.gap,
        height: s.h, padding: `0 ${s.px}px`,
        borderRadius: "var(--mv-radius-sm)",
        border: k.border, background: k.bg, color: k.fg,
        fontFamily: "var(--mv-font-sans)", fontSize: s.font, fontWeight: 600,
        letterSpacing: "0.01em", whiteSpace: "nowrap", ...style,
      }}
      {...rest}
    >
      {showIcon ? <Icon name={k.icon} size={s.icon} /> : null}
      {children || k.label}
    </span>
  );
}
