import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Monevo Field — texto, valor monetário (máscara BRL), com rótulo,
   ajuda e estados de foco/erro. Alvo de toque ≥44px. */

function formatBRLFromMinor(minor) {
  if (minor == null || minor === "") return "";
  const neg = minor < 0;
  const abs = Math.abs(Math.trunc(minor));
  const reais = Math.floor(abs / 100);
  const cents = String(abs % 100).padStart(2, "0");
  const reaisStr = reais.toLocaleString("pt-BR");
  return `${neg ? "\u2212" : ""}R$ ${reaisStr},${cents}`;
}

export function Field({
  label,
  type = "text",
  money = false,
  value,
  onChange,
  placeholder,
  hint,
  error,
  prefix,
  iconLeft,
  disabled = false,
  required = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const reactId = React.useId ? React.useId() : "mv-field";
  const fid = id || reactId;
  const hasError = !!error;

  const display = money ? formatBRLFromMinor(value) : value;

  const handleMoney = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    const minor = digits === "" ? null : parseInt(digits, 10);
    onChange && onChange(minor, e);
  };

  const borderColor = hasError ? "var(--mv-negative-fg)"
    : focus ? "var(--mv-primary)" : "var(--mv-border-strong)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label ? (
        <label htmlFor={fid} style={{
          fontFamily: "var(--mv-font-sans)", fontSize: "var(--mv-label-size)",
          fontWeight: 500, color: "var(--mv-text-secondary)",
        }}>
          {label}{required ? <span style={{ color: "var(--mv-negative-fg)" }}> *</span> : null}
        </label>
      ) : null}

      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        height: 44, padding: "0 14px",
        background: disabled ? "var(--mv-neutral-100)" : "var(--mv-surface)",
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--mv-radius-md)",
        boxShadow: focus && !hasError ? "var(--mv-shadow-focus)"
          : hasError && focus ? "0 0 0 3px rgba(201,42,54,0.28)" : "none",
        transition: "border-color var(--mv-dur-fast), box-shadow var(--mv-dur-fast)",
      }}>
        {iconLeft ? <Icon name={iconLeft} size={18} color="var(--mv-text-muted)" /> : null}
        {prefix ? <span style={{ color: "var(--mv-text-muted)", fontSize: 15, fontFamily: "var(--mv-font-sans)" }}>{prefix}</span> : null}
        <input
          id={fid}
          type={type}
          inputMode={money ? "numeric" : undefined}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hint || error ? `${fid}-help` : undefined}
          value={display ?? ""}
          placeholder={money ? "R$ 0,00" : placeholder}
          onChange={money ? handleMoney : onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, width: "100%", border: "none", outline: "none",
            background: "transparent", color: "var(--mv-text-primary)",
            fontFamily: "var(--mv-font-sans)", fontSize: 15,
            fontVariantNumeric: money ? "tabular-nums" : undefined,
            textAlign: money ? "right" : "left",
          }}
          {...rest}
        />
      </div>

      {hint && !hasError ? (
        <span id={`${fid}-help`} style={{ fontSize: 12, color: "var(--mv-text-muted)", fontFamily: "var(--mv-font-sans)" }}>{hint}</span>
      ) : null}
      {hasError ? (
        <span id={`${fid}-help`} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--mv-negative-fg)", fontFamily: "var(--mv-font-sans)" }}>
          <Icon name="alertTriangle" size={13} /> {error}
        </span>
      ) : null}
    </div>
  );
}
