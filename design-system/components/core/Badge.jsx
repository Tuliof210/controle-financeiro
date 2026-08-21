import React from "react";
import { Icon } from "./Icon.jsx";

/* Monevo Badge / Pill — rótulo de estado, categoria, escopo de perfil
   e marcação "principal". Forma pill; cor reforça, nunca é o único sinal. */

const TONES = {
  neutral:  { fg: "var(--mv-text-secondary)", bg: "var(--mv-neutral-100)", bd: "var(--mv-border)" },
  positive: { fg: "var(--mv-positive-fg)", bg: "var(--mv-positive-bg)", bd: "var(--mv-positive-border)" },
  negative: { fg: "var(--mv-negative-fg)", bg: "var(--mv-negative-bg)", bd: "var(--mv-negative-border)" },
  alert:    { fg: "var(--mv-alert-fg)", bg: "var(--mv-alert-bg)", bd: "var(--mv-alert-border)" },
  info:     { fg: "var(--mv-info-fg)", bg: "var(--mv-info-bg)", bd: "var(--mv-info-border)" },
  ai:       { fg: "var(--mv-ai-fg)", bg: "var(--mv-ai-bg)", bd: "var(--mv-ai-border)" },
  cobalt:   { fg: "var(--mv-cobalt-700)", bg: "var(--mv-cobalt-50)", bd: "var(--mv-cobalt-100)" },
};

const SIZES = {
  sm: { h: 20, px: 8, font: 11, icon: 12, gap: 4 },
  md: { h: 26, px: 10, font: 12, icon: 14, gap: 5 },
};

export function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  size = "md",
  icon,
  dot = false,
  scope,        // "PF" | "PJ" | custom string → escopo de perfil
  principal = false, // marcação principal
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;

  // Escopo de perfil: forma distinta (ícone + rótulo), sempre cobalt-tinted neutro
  if (scope) {
    const isPF = scope === "PF";
    const isPJ = scope === "PJ";
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: s.gap,
        height: s.h, padding: `0 ${s.px}px`, borderRadius: "var(--mv-radius-pill)",
        fontFamily: "var(--mv-font-sans)", fontSize: s.font, fontWeight: 600,
        letterSpacing: "0.02em",
        color: "var(--mv-cobalt-700)", background: "var(--mv-cobalt-50)",
        border: "1px solid var(--mv-cobalt-100)", ...style,
      }} {...rest}>
        <Icon name={isPJ ? "building" : "user"} size={s.icon} />
        {children || (isPF ? "Pessoa física" : isPJ ? "Pessoa jurídica" : scope)}
      </span>
    );
  }

  const t = TONES[tone] || TONES.neutral;
  const solid = variant === "solid";
  const outline = variant === "outline";

  // marcação "principal": cobalt sólido com check
  if (principal) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: s.gap,
        height: s.h, padding: `0 ${s.px}px`, borderRadius: "var(--mv-radius-pill)",
        fontFamily: "var(--mv-font-sans)", fontSize: s.font, fontWeight: 600,
        color: "var(--mv-on-primary)", background: "var(--mv-primary)",
        border: "1px solid transparent", ...style,
      }} {...rest}>
        <Icon name="check" size={s.icon} />
        {children || "Principal"}
      </span>
    );
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: s.gap,
      height: s.h, padding: `0 ${s.px}px`, borderRadius: "var(--mv-radius-pill)",
      fontFamily: "var(--mv-font-sans)", fontSize: s.font, fontWeight: 600,
      letterSpacing: "0.01em",
      color: solid ? "var(--mv-white)" : t.fg,
      background: solid ? t.fg : outline ? "transparent" : t.bg,
      border: `1px solid ${solid ? "transparent" : t.bd}`,
      ...style,
    }} {...rest}>
      {dot ? <span style={{ width: 6, height: 6, borderRadius: 999, background: solid ? "var(--mv-white)" : t.fg, flex: "none" }} /> : null}
      {icon ? <Icon name={icon} size={s.icon} /> : null}
      {children}
    </span>
  );
}
