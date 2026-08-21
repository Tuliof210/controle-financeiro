import React from "react";

/* Monevo MoneyDisplay — primitivo único de valor.
   - value em MINOR UNITS (centavos): 1099 → R$ 10,99
   - variantes: hero / large / base / small / delta
   - algarismos TABULARES, formato pt-BR
   - sinal automático, minus Unicode − (U+2212), nunca hífen ASCII
   - decimais esmaecidos (~0.45) em hero/large */

const SYMBOLS = { BRL: "R$", USD: "US$", EUR: "€" };

const VARIANTS = {
  hero:  { size: "var(--mv-money-hero-size)",  weight: 600, font: "var(--mv-font-display)", lh: 1.0,  dim: true },
  large: { size: "var(--mv-money-large-size)", weight: 600, font: "var(--mv-font-display)", lh: 1.05, dim: true },
  base:  { size: "var(--mv-money-base-size)",  weight: 600, font: "var(--mv-font-sans)",    lh: 1.3,  dim: false },
  small: { size: "var(--mv-money-small-size)", weight: 600, font: "var(--mv-font-sans)",    lh: 1.3,  dim: false },
  delta: { size: "var(--mv-money-delta-size)", weight: 600, font: "var(--mv-font-sans)",    lh: 1.2,  dim: false },
};

function parts(minor, locale) {
  const n = Number(minor) || 0;
  const neg = n < 0;
  const abs = Math.abs(Math.trunc(n));
  const intStr = Math.floor(abs / 100).toLocaleString(locale);
  const cents = String(abs % 100).padStart(2, "0");
  return { neg, intStr, cents };
}

export function MoneyDisplay({
  value,
  currency = "BRL",
  locale = "pt-BR",
  variant = "base",
  showPositiveSign = false,
  colorBySign = false,
  dimDecimals,        // override; default segue a variante
  hideSymbol = false,
  hideCents = false,
  color,
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.base;
  const { neg, intStr, cents } = parts(value, locale);
  const dim = dimDecimals != null ? dimDecimals : v.dim;
  const sign = neg ? "\u2212" : (showPositiveSign ? "+" : "");

  let resolvedColor = color || "var(--mv-text-primary)";
  if (colorBySign) {
    resolvedColor = neg ? "var(--mv-negative-fg)" : "var(--mv-positive-fg)";
  }

  const full = `${sign}${SYMBOLS[currency] || ""} ${intStr}${hideCents ? "" : "," + cents}`;

  return (
    <span
      aria-label={full}
      style={{
        fontFamily: v.font, fontSize: v.size, fontWeight: v.weight, lineHeight: v.lh,
        fontVariantNumeric: "tabular-nums", letterSpacing: variant === "hero" || variant === "large" ? "-0.01em" : "0",
        color: resolvedColor, whiteSpace: "nowrap", display: "inline-flex", alignItems: "baseline",
        ...style,
      }}
      {...rest}
    >
      <span aria-hidden="true">
        {sign}
        {!hideSymbol ? <span style={{ marginRight: "0.28em" }}>{SYMBOLS[currency]}</span> : null}
        {intStr}
        {!hideCents ? (
          <span style={{ opacity: dim ? "var(--mv-money-decimal-opacity)" : 1 }}>,{cents}</span>
        ) : null}
      </span>
    </span>
  );
}
