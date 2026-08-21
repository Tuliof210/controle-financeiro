import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Monevo Delta — variação com sinal, cor e direção. Usado em KPIs.
   Aceita variação em pontos percentuais (percent) OU em centavos (money).
   Positivo = positivo (verde ↑), negativo = negativo (vermelho ↓).
   Inverter semântica quando "menos é melhor" (ex.: gasto) via invert. */

function fmtPercent(p, locale) {
  const abs = Math.abs(p);
  return abs.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + "%";
}
function fmtMoney(minor, locale) {
  const abs = Math.abs(Math.trunc(minor));
  const intStr = Math.floor(abs / 100).toLocaleString(locale);
  const cents = String(abs % 100).padStart(2, "0");
  return `R$ ${intStr},${cents}`;
}

export function Delta({
  value,            // número: % se percent, centavos se money
  percent = true,   // default percentual
  money = false,
  invert = false,   // true quando queda é "bom" (ex.: despesa)
  showArrow = true,
  neutralThreshold = 0,
  size = "md",
  locale = "pt-BR",
  style,
  ...rest
}) {
  const n = Number(value) || 0;
  const isUp = n > neutralThreshold;
  const isDown = n < -neutralThreshold;
  const isNeutral = !isUp && !isDown;

  // "bom" depende de invert
  const good = invert ? isDown : isUp;
  const color = isNeutral ? "var(--mv-text-muted)"
    : good ? "var(--mv-positive-fg)" : "var(--mv-negative-fg)";

  const sign = isUp ? "+" : isDown ? "\u2212" : "";
  const label = money ? fmtMoney(n, locale) : (percent ? fmtPercent(n, locale) : Math.abs(n).toLocaleString(locale));
  const arrow = isUp ? "arrowUpRight" : isDown ? "arrowDownRight" : "minus";

  const fontSize = size === "sm" ? 12 : size === "lg" ? 15 : 13;
  const iconSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  return (
    <span
      role="status"
      style={{
        display: "inline-flex", alignItems: "center", gap: 3,
        fontFamily: "var(--mv-font-sans)", fontSize, fontWeight: 600,
        fontVariantNumeric: "tabular-nums", color, ...style,
      }}
      {...rest}
    >
      {showArrow ? <Icon name={arrow} size={iconSize} /> : null}
      <span>{sign}{label}</span>
    </span>
  );
}
