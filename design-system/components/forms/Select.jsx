import React from "react";
import { Icon } from "../core/Icon.jsx";

/* Monevo Select — campo de seleção nativo estilizado. */

export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Selecione…",
  hint,
  error,
  disabled = false,
  required = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const reactId = React.useId ? React.useId() : "mv-select";
  const fid = id || reactId;
  const hasError = !!error;
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
        position: "relative", display: "flex", alignItems: "center",
        height: 44,
        background: disabled ? "var(--mv-neutral-100)" : "var(--mv-surface)",
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--mv-radius-md)",
        boxShadow: focus && !hasError ? "var(--mv-shadow-focus)" : "none",
        transition: "border-color var(--mv-dur-fast), box-shadow var(--mv-dur-fast)",
      }}>
        <select
          id={fid}
          disabled={disabled}
          value={value ?? ""}
          aria-invalid={hasError || undefined}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: "none", WebkitAppearance: "none",
            flex: 1, width: "100%", height: "100%",
            border: "none", outline: "none", background: "transparent",
            padding: "0 40px 0 14px",
            color: value ? "var(--mv-text-primary)" : "var(--mv-text-muted)",
            fontFamily: "var(--mv-font-sans)", fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
          }}
          {...rest}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((o) => {
            const val = typeof o === "string" ? o : o.value;
            const lbl = typeof o === "string" ? o : o.label;
            return <option key={val} value={val}>{lbl}</option>;
          })}
        </select>
        <span style={{ position: "absolute", right: 12, pointerEvents: "none", display: "flex" }}>
          <Icon name="chevronDown" size={18} color="var(--mv-text-muted)" />
        </span>
      </div>

      {hint && !hasError ? (
        <span style={{ fontSize: 12, color: "var(--mv-text-muted)", fontFamily: "var(--mv-font-sans)" }}>{hint}</span>
      ) : null}
      {hasError ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--mv-negative-fg)", fontFamily: "var(--mv-font-sans)" }}>
          <Icon name="alertTriangle" size={13} /> {error}
        </span>
      ) : null}
    </div>
  );
}
