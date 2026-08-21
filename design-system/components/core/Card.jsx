import React from "react";

/* Monevo Card — superfície base do produto.
   Padrão é PLANO (borda, sem sombra). `elevated` (md) só quando o card
   FLUTUA sobre conteúdo. `sunken` para áreas de leitura/aninhadas. */

const VARIANTS = {
  flat:     { bg: "var(--mv-surface)",        border: "1px solid var(--mv-border)", shadow: "var(--mv-shadow-sm)" },
  elevated: { bg: "var(--mv-surface-elev)",   border: "1px solid var(--mv-border-subtle)", shadow: "var(--mv-shadow-md)" },
  sunken:   { bg: "var(--mv-surface-sunken)", border: "1px solid var(--mv-border-subtle)", shadow: "none" },
  outline:  { bg: "transparent",              border: "1px solid var(--mv-border)", shadow: "none" },
};

export function Card({
  children,
  variant = "flat",
  padding = 20,
  radius = "var(--mv-radius-lg)",
  interactive = false,
  as = "div",
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.flat;
  const [hover, setHover] = React.useState(false);
  const El = as;

  return (
    <El
      onMouseEnter={interactive ? () => setHover(true) : undefined}
      onMouseLeave={interactive ? () => setHover(false) : undefined}
      style={{
        background: v.bg,
        border: v.border,
        borderRadius: radius,
        boxShadow: interactive && hover ? "var(--mv-shadow-md)" : v.shadow,
        padding,
        transition: "box-shadow var(--mv-dur-base) var(--mv-ease-standard), transform var(--mv-dur-base) var(--mv-ease-standard)",
        transform: interactive && hover ? "translateY(-1px)" : "none",
        cursor: interactive ? "pointer" : undefined,
        ...style,
      }}
      {...rest}
    >
      {children}
    </El>
  );
}
