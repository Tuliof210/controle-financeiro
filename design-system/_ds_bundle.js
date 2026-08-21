/* @ds-bundle: {"format":3,"namespace":"MonevoDesignSystem_f93edc","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"MV_ICONS","sourcePath":"components/core/Icon.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Delta","sourcePath":"components/money/Delta.jsx"},{"name":"MoneyDisplay","sourcePath":"components/money/MoneyDisplay.jsx"},{"name":"ProjectionBadge","sourcePath":"components/money/ProjectionBadge.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"245284d14548","components/core/Badge.jsx":"4a8b7a07c62c","components/core/Card.jsx":"eddc063893eb","components/core/Icon.jsx":"364a5f1857ab","components/forms/Button.jsx":"88d84cb4a54a","components/forms/Field.jsx":"f390e0d1c3fb","components/forms/Select.jsx":"84ed47c2a1f5","components/money/Delta.jsx":"cb3f03e9e621","components/money/MoneyDisplay.jsx":"0efff3a5f389","components/money/ProjectionBadge.jsx":"64d5a2239f74"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MonevoDesignSystem_f93edc = window.MonevoDesignSystem_f93edc || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo Avatar — iniciais com cor derivada do nome (paleta de categorias).
   Determinístico: o mesmo nome sempre rende a mesma cor. */

const PALETTE = ["--mv-cat-01", "--mv-cat-02", "--mv-cat-03", "--mv-cat-04", "--mv-cat-05", "--mv-cat-06", "--mv-cat-07", "--mv-cat-08", "--mv-cat-09", "--mv-cat-10"];
const SIZES = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 56
};
function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function hashColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function Avatar({
  name = "",
  src,
  size = "md",
  shape = "circle",
  color,
  style,
  ...rest
}) {
  const px = typeof size === "number" ? size : SIZES[size] || SIZES.md;
  const radius = shape === "square" ? "var(--mv-radius-md)" : "var(--mv-radius-full)";
  const baseColor = color || `var(${hashColor(name)})`;
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "img",
    "aria-label": name || "Avatar",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: px,
      height: px,
      borderRadius: radius,
      overflow: "hidden",
      flex: "none",
      userSelect: "none",
      background: src ? "var(--mv-neutral-100)" : baseColor,
      color: "var(--mv-white)",
      fontFamily: "var(--mv-font-sans)",
      fontWeight: 600,
      fontSize: Math.round(px * 0.40),
      lineHeight: 1,
      letterSpacing: "0.01em",
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo Card — superfície base do produto.
   Padrão é PLANO (borda, sem sombra). `elevated` (md) só quando o card
   FLUTUA sobre conteúdo. `sunken` para áreas de leitura/aninhadas. */

const VARIANTS = {
  flat: {
    bg: "var(--mv-surface)",
    border: "1px solid var(--mv-border)",
    shadow: "var(--mv-shadow-sm)"
  },
  elevated: {
    bg: "var(--mv-surface-elev)",
    border: "1px solid var(--mv-border-subtle)",
    shadow: "var(--mv-shadow-md)"
  },
  sunken: {
    bg: "var(--mv-surface-sunken)",
    border: "1px solid var(--mv-border-subtle)",
    shadow: "none"
  },
  outline: {
    bg: "transparent",
    border: "1px solid var(--mv-border)",
    shadow: "none"
  }
};
function Card({
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
  return /*#__PURE__*/React.createElement(El, _extends({
    onMouseEnter: interactive ? () => setHover(true) : undefined,
    onMouseLeave: interactive ? () => setHover(false) : undefined,
    style: {
      background: v.bg,
      border: v.border,
      borderRadius: radius,
      boxShadow: interactive && hover ? "var(--mv-shadow-md)" : v.shadow,
      padding,
      transition: "box-shadow var(--mv-dur-base) var(--mv-ease-standard), transform var(--mv-dur-base) var(--mv-ease-standard)",
      transform: interactive && hover ? "translateY(-1px)" : "none",
      cursor: interactive ? "pointer" : undefined,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo single-stroke icon system.
   24×24 grid, 1.75 stroke, round caps/joins, currentColor.
   NEVER draw an inline icon outside this set — add it here instead. */

const MV_ICONS = {
  wallet: "M3 8.5A2.5 2.5 0 0 1 5.5 6H18a2 2 0 0 1 2 2v1M3 8.5V17a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2M3 8.5V8m18 4h-4a2 2 0 0 0 0 4h4",
  card: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 4h18M7 16h4",
  target: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
  trendingUp: "M3 17l6-6 4 4 8-8M21 7v5m0-5h-5",
  trendingDown: "M3 7l6 6 4-4 8 8M21 17v-5m0 5h-5",
  arrowUpRight: "M7 17 17 7M9 7h8v8",
  arrowDownRight: "M7 7l10 10M17 9v8H9",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  repeat: "M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4m14 5v2a4 4 0 0 1-4 4H3",
  calendar: "M7 3v3m10-3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  alertTriangle: "M12 9v4m0 4h.01M10.3 4.3 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z",
  sparkles: "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  lock: "M6 10V8a6 6 0 0 1 12 0v2M5 10h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z",
  check: "M5 12.5 10 17 19 7",
  x: "M6 6l12 12M18 6 6 18",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 6l6 6-6 6",
  archive: "M4 7h16M5 7v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7M4 7l1.5-3h13L20 7M10 12h4",
  search: "M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M21 21l-4.3-4.3",
  settings: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M19.4 13a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.2A1.6 1.6 0 0 0 7 19.3a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.2A1.6 1.6 0 0 0 2.7 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 0 1 4 0v.2A1.6 1.6 0 0 0 13 2.7a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z",
  bell: "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0",
  user: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M4 20a8 8 0 0 1 16 0",
  building: "M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M8 8h3M8 12h3M8 16h3M3 21h18",
  pieChart: "M12 3a9 9 0 1 0 9 9h-9V3Z M14 3a7 7 0 0 1 7 7h-7V3Z",
  banknote: "M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Zm8 5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M7 9v.01M17 15v.01"
};
function Icon({
  name,
  size = 20,
  strokeWidth = 1.75,
  color = "currentColor",
  title,
  style,
  ...rest
}) {
  const d = MV_ICONS[name];
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: title ? "img" : "presentation",
    "aria-hidden": title ? undefined : true,
    "aria-label": title,
    style: {
      display: "block",
      flex: "none",
      ...style
    }
  }, rest), title ? /*#__PURE__*/React.createElement("title", null, title) : null, d ? /*#__PURE__*/React.createElement("path", {
    d: d
  }) : null);
}
Object.assign(__ds_scope, { MV_ICONS, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo Badge / Pill — rótulo de estado, categoria, escopo de perfil
   e marcação "principal". Forma pill; cor reforça, nunca é o único sinal. */

const TONES = {
  neutral: {
    fg: "var(--mv-text-secondary)",
    bg: "var(--mv-neutral-100)",
    bd: "var(--mv-border)"
  },
  positive: {
    fg: "var(--mv-positive-fg)",
    bg: "var(--mv-positive-bg)",
    bd: "var(--mv-positive-border)"
  },
  negative: {
    fg: "var(--mv-negative-fg)",
    bg: "var(--mv-negative-bg)",
    bd: "var(--mv-negative-border)"
  },
  alert: {
    fg: "var(--mv-alert-fg)",
    bg: "var(--mv-alert-bg)",
    bd: "var(--mv-alert-border)"
  },
  info: {
    fg: "var(--mv-info-fg)",
    bg: "var(--mv-info-bg)",
    bd: "var(--mv-info-border)"
  },
  ai: {
    fg: "var(--mv-ai-fg)",
    bg: "var(--mv-ai-bg)",
    bd: "var(--mv-ai-border)"
  },
  cobalt: {
    fg: "var(--mv-cobalt-700)",
    bg: "var(--mv-cobalt-50)",
    bd: "var(--mv-cobalt-100)"
  }
};
const SIZES = {
  sm: {
    h: 20,
    px: 8,
    font: 11,
    icon: 12,
    gap: 4
  },
  md: {
    h: 26,
    px: 10,
    font: 12,
    icon: 14,
    gap: 5
  }
};
function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  size = "md",
  icon,
  dot = false,
  scope,
  // "PF" | "PJ" | custom string → escopo de perfil
  principal = false,
  // marcação principal
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;

  // Escopo de perfil: forma distinta (ícone + rótulo), sempre cobalt-tinted neutro
  if (scope) {
    const isPF = scope === "PF";
    const isPJ = scope === "PJ";
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        height: s.h,
        padding: `0 ${s.px}px`,
        borderRadius: "var(--mv-radius-pill)",
        fontFamily: "var(--mv-font-sans)",
        fontSize: s.font,
        fontWeight: 600,
        letterSpacing: "0.02em",
        color: "var(--mv-cobalt-700)",
        background: "var(--mv-cobalt-50)",
        border: "1px solid var(--mv-cobalt-100)",
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: isPJ ? "building" : "user",
      size: s.icon
    }), children || (isPF ? "Pessoa física" : isPJ ? "Pessoa jurídica" : scope));
  }
  const t = TONES[tone] || TONES.neutral;
  const solid = variant === "solid";
  const outline = variant === "outline";

  // marcação "principal": cobalt sólido com check
  if (principal) {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        height: s.h,
        padding: `0 ${s.px}px`,
        borderRadius: "var(--mv-radius-pill)",
        fontFamily: "var(--mv-font-sans)",
        fontSize: s.font,
        fontWeight: 600,
        color: "var(--mv-on-primary)",
        background: "var(--mv-primary)",
        border: "1px solid transparent",
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: s.icon
    }), children || "Principal");
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: s.gap,
      height: s.h,
      padding: `0 ${s.px}px`,
      borderRadius: "var(--mv-radius-pill)",
      fontFamily: "var(--mv-font-sans)",
      fontSize: s.font,
      fontWeight: 600,
      letterSpacing: "0.01em",
      color: solid ? "var(--mv-white)" : t.fg,
      background: solid ? t.fg : outline ? "transparent" : t.bg,
      border: `1px solid ${solid ? "transparent" : t.bd}`,
      ...style
    }
  }, rest), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: 999,
      background: solid ? "var(--mv-white)" : t.fg,
      flex: "none"
    }
  }) : null, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo Button — cobalto é a única ação primária; texto sobre cobalto é branco.
   Neutros carregam secondary/ghost. Destrutivo usa vermelho semântico. */

const SIZES = {
  sm: {
    h: 36,
    px: 14,
    font: 14,
    gap: 6,
    icon: 16
  },
  md: {
    h: 44,
    px: 18,
    font: 15,
    gap: 8,
    icon: 18
  },
  // 44 = alvo de toque mínimo
  lg: {
    h: 52,
    px: 24,
    font: 16,
    gap: 8,
    icon: 20
  }
};
const VARIANTS = {
  primary: {
    bg: "var(--mv-primary)",
    color: "var(--mv-on-primary)",
    border: "transparent",
    hoverBg: "var(--mv-primary-hover)",
    activeBg: "var(--mv-primary-active)"
  },
  secondary: {
    bg: "var(--mv-surface)",
    color: "var(--mv-text-primary)",
    border: "var(--mv-border-strong)",
    hoverBg: "var(--mv-neutral-50)",
    activeBg: "var(--mv-neutral-100)"
  },
  ghost: {
    bg: "transparent",
    color: "var(--mv-text-primary)",
    border: "transparent",
    hoverBg: "var(--mv-neutral-100)",
    activeBg: "var(--mv-neutral-150)"
  },
  destructive: {
    bg: "var(--mv-negative-fg)",
    color: "var(--mv-white)",
    border: "transparent",
    hoverBg: "#B02530",
    activeBg: "#9A2029"
  }
};
function Button({
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
  const bg = isDisabled ? "var(--mv-neutral-100)" : active ? v.activeBg : hover ? v.hoverBg : v.bg;
  const color = isDisabled ? "var(--mv-text-disabled)" : v.color;
  const border = isDisabled ? "var(--mv-border)" : v.border;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: isDisabled,
    "aria-busy": loading || undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      height: s.h,
      minWidth: s.h,
      padding: `0 ${s.px}px`,
      width: fullWidth ? "100%" : undefined,
      fontFamily: "var(--mv-font-sans)",
      fontSize: s.font,
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: "-0.005em",
      color,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: "var(--mv-radius-md)",
      cursor: isDisabled ? "not-allowed" : "pointer",
      transition: "background var(--mv-dur-fast) var(--mv-ease-standard), transform var(--mv-dur-fast) var(--mv-ease-standard)",
      transform: active && !isDisabled ? "scale(0.985)" : "scale(1)",
      outline: "none",
      whiteSpace: "nowrap",
      userSelect: "none",
      ...style
    },
    onFocus: e => {
      e.currentTarget.style.boxShadow = "var(--mv-shadow-focus)";
    },
    onBlur: e => {
      e.currentTarget.style.boxShadow = "none";
    }
  }, rest), loading ? /*#__PURE__*/React.createElement(Spinner, {
    size: s.icon,
    color: color
  }) : iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: s.icon
  }) : null, children ? /*#__PURE__*/React.createElement("span", null, children) : null, !loading && iconRight ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  }) : null);
}
function Spinner({
  size = 18,
  color = "currentColor"
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      animation: "mv-spin 0.7s linear infinite"
    },
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9",
    stroke: color,
    strokeOpacity: "0.25",
    strokeWidth: "2.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M21 12a9 9 0 0 0-9-9",
    stroke: color,
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }), /*#__PURE__*/React.createElement("style", null, "@keyframes mv-spin{to{transform:rotate(360deg)}}"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
function Field({
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
  const handleMoney = e => {
    const digits = e.target.value.replace(/\D/g, "");
    const minor = digits === "" ? null : parseInt(digits, 10);
    onChange && onChange(minor, e);
  };
  const borderColor = hasError ? "var(--mv-negative-fg)" : focus ? "var(--mv-primary)" : "var(--mv-border-strong)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontFamily: "var(--mv-font-sans)",
      fontSize: "var(--mv-label-size)",
      fontWeight: 500,
      color: "var(--mv-text-secondary)"
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--mv-negative-fg)"
    }
  }, " *") : null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 44,
      padding: "0 14px",
      background: disabled ? "var(--mv-neutral-100)" : "var(--mv-surface)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--mv-radius-md)",
      boxShadow: focus && !hasError ? "var(--mv-shadow-focus)" : hasError && focus ? "0 0 0 3px rgba(201,42,54,0.28)" : "none",
      transition: "border-color var(--mv-dur-fast), box-shadow var(--mv-dur-fast)"
    }
  }, iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: 18,
    color: "var(--mv-text-muted)"
  }) : null, prefix ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--mv-text-muted)",
      fontSize: 15,
      fontFamily: "var(--mv-font-sans)"
    }
  }, prefix) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: type,
    inputMode: money ? "numeric" : undefined,
    disabled: disabled,
    "aria-invalid": hasError || undefined,
    "aria-describedby": hint || error ? `${fid}-help` : undefined,
    value: display ?? "",
    placeholder: money ? "R$ 0,00" : placeholder,
    onChange: money ? handleMoney : onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      width: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      color: "var(--mv-text-primary)",
      fontFamily: "var(--mv-font-sans)",
      fontSize: 15,
      fontVariantNumeric: money ? "tabular-nums" : undefined,
      textAlign: money ? "right" : "left"
    }
  }, rest))), hint && !hasError ? /*#__PURE__*/React.createElement("span", {
    id: `${fid}-help`,
    style: {
      fontSize: 12,
      color: "var(--mv-text-muted)",
      fontFamily: "var(--mv-font-sans)"
    }
  }, hint) : null, hasError ? /*#__PURE__*/React.createElement("span", {
    id: `${fid}-help`,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12,
      color: "var(--mv-negative-fg)",
      fontFamily: "var(--mv-font-sans)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "alertTriangle",
    size: 13
  }), " ", error) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo Select — campo de seleção nativo estilizado. */

function Select({
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
  const borderColor = hasError ? "var(--mv-negative-fg)" : focus ? "var(--mv-primary)" : "var(--mv-border-strong)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    style: {
      fontFamily: "var(--mv-font-sans)",
      fontSize: "var(--mv-label-size)",
      fontWeight: 500,
      color: "var(--mv-text-secondary)"
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--mv-negative-fg)"
    }
  }, " *") : null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      height: 44,
      background: disabled ? "var(--mv-neutral-100)" : "var(--mv-surface)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--mv-radius-md)",
      boxShadow: focus && !hasError ? "var(--mv-shadow-focus)" : "none",
      transition: "border-color var(--mv-dur-fast), box-shadow var(--mv-dur-fast)"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: fid,
    disabled: disabled,
    value: value ?? "",
    "aria-invalid": hasError || undefined,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: "none",
      WebkitAppearance: "none",
      flex: 1,
      width: "100%",
      height: "100%",
      border: "none",
      outline: "none",
      background: "transparent",
      padding: "0 40px 0 14px",
      color: value ? "var(--mv-text-primary)" : "var(--mv-text-muted)",
      fontFamily: "var(--mv-font-sans)",
      fontSize: 15,
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, rest), /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true,
    hidden: true
  }, placeholder), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lbl = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 12,
      pointerEvents: "none",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevronDown",
    size: 18,
    color: "var(--mv-text-muted)"
  }))), hint && !hasError ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--mv-text-muted)",
      fontFamily: "var(--mv-font-sans)"
    }
  }, hint) : null, hasError ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12,
      color: "var(--mv-negative-fg)",
      fontFamily: "var(--mv-font-sans)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "alertTriangle",
    size: 13
  }), " ", error) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/money/Delta.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo Delta — variação com sinal, cor e direção. Usado em KPIs.
   Aceita variação em pontos percentuais (percent) OU em centavos (money).
   Positivo = positivo (verde ↑), negativo = negativo (vermelho ↓).
   Inverter semântica quando "menos é melhor" (ex.: gasto) via invert. */

function fmtPercent(p, locale) {
  const abs = Math.abs(p);
  return abs.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }) + "%";
}
function fmtMoney(minor, locale) {
  const abs = Math.abs(Math.trunc(minor));
  const intStr = Math.floor(abs / 100).toLocaleString(locale);
  const cents = String(abs % 100).padStart(2, "0");
  return `R$ ${intStr},${cents}`;
}
function Delta({
  value,
  // número: % se percent, centavos se money
  percent = true,
  // default percentual
  money = false,
  invert = false,
  // true quando queda é "bom" (ex.: despesa)
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
  const color = isNeutral ? "var(--mv-text-muted)" : good ? "var(--mv-positive-fg)" : "var(--mv-negative-fg)";
  const sign = isUp ? "+" : isDown ? "\u2212" : "";
  const label = money ? fmtMoney(n, locale) : percent ? fmtPercent(n, locale) : Math.abs(n).toLocaleString(locale);
  const arrow = isUp ? "arrowUpRight" : isDown ? "arrowDownRight" : "minus";
  const fontSize = size === "sm" ? 12 : size === "lg" ? 15 : 13;
  const iconSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "status",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      fontFamily: "var(--mv-font-sans)",
      fontSize,
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
      color,
      ...style
    }
  }, rest), showArrow ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: arrow,
    size: iconSize
  }) : null, /*#__PURE__*/React.createElement("span", null, sign, label));
}
Object.assign(__ds_scope, { Delta });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/Delta.jsx", error: String((e && e.message) || e) }); }

// components/money/MoneyDisplay.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo MoneyDisplay — primitivo único de valor.
   - value em MINOR UNITS (centavos): 1099 → R$ 10,99
   - variantes: hero / large / base / small / delta
   - algarismos TABULARES, formato pt-BR
   - sinal automático, minus Unicode − (U+2212), nunca hífen ASCII
   - decimais esmaecidos (~0.45) em hero/large */

const SYMBOLS = {
  BRL: "R$",
  USD: "US$",
  EUR: "€"
};
const VARIANTS = {
  hero: {
    size: "var(--mv-money-hero-size)",
    weight: 600,
    font: "var(--mv-font-display)",
    lh: 1.0,
    dim: true
  },
  large: {
    size: "var(--mv-money-large-size)",
    weight: 600,
    font: "var(--mv-font-display)",
    lh: 1.05,
    dim: true
  },
  base: {
    size: "var(--mv-money-base-size)",
    weight: 600,
    font: "var(--mv-font-sans)",
    lh: 1.3,
    dim: false
  },
  small: {
    size: "var(--mv-money-small-size)",
    weight: 600,
    font: "var(--mv-font-sans)",
    lh: 1.3,
    dim: false
  },
  delta: {
    size: "var(--mv-money-delta-size)",
    weight: 600,
    font: "var(--mv-font-sans)",
    lh: 1.2,
    dim: false
  }
};
function parts(minor, locale) {
  const n = Number(minor) || 0;
  const neg = n < 0;
  const abs = Math.abs(Math.trunc(n));
  const intStr = Math.floor(abs / 100).toLocaleString(locale);
  const cents = String(abs % 100).padStart(2, "0");
  return {
    neg,
    intStr,
    cents
  };
}
function MoneyDisplay({
  value,
  currency = "BRL",
  locale = "pt-BR",
  variant = "base",
  showPositiveSign = false,
  colorBySign = false,
  dimDecimals,
  // override; default segue a variante
  hideSymbol = false,
  hideCents = false,
  color,
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.base;
  const {
    neg,
    intStr,
    cents
  } = parts(value, locale);
  const dim = dimDecimals != null ? dimDecimals : v.dim;
  const sign = neg ? "\u2212" : showPositiveSign ? "+" : "";
  let resolvedColor = color || "var(--mv-text-primary)";
  if (colorBySign) {
    resolvedColor = neg ? "var(--mv-negative-fg)" : "var(--mv-positive-fg)";
  }
  const full = `${sign}${SYMBOLS[currency] || ""} ${intStr}${hideCents ? "" : "," + cents}`;
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-label": full,
    style: {
      fontFamily: v.font,
      fontSize: v.size,
      fontWeight: v.weight,
      lineHeight: v.lh,
      fontVariantNumeric: "tabular-nums",
      letterSpacing: variant === "hero" || variant === "large" ? "-0.01em" : "0",
      color: resolvedColor,
      whiteSpace: "nowrap",
      display: "inline-flex",
      alignItems: "baseline",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, sign, !hideSymbol ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginRight: "0.28em"
    }
  }, SYMBOLS[currency]) : null, intStr, !hideCents ? /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: dim ? "var(--mv-money-decimal-opacity)" : 1
    }
  }, ",", cents) : null));
}
Object.assign(__ds_scope, { MoneyDisplay });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/MoneyDisplay.jsx", error: String((e && e.message) || e) }); }

// components/money/ProjectionBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Monevo ProjectionBadge — distingue REAL / ESTIMADO / SIMULADO.
   Crítico (a11y): a diferença é RÓTULO + FORMA/TEXTURA, nunca só cor.
   - real:     contorno SÓLIDO, fundo neutro, ícone check
   - estimado: contorno PONTILHADO, ícone calendário
   - simulado: contorno TRACEJADO cobalt, ícone sparkles/alvo */

const KINDS = {
  real: {
    label: "Real",
    icon: "check",
    fg: "var(--mv-proj-real-fg)",
    bg: "var(--mv-proj-real-bg)",
    border: "1px solid var(--mv-neutral-300)"
  },
  estimado: {
    label: "Estimado",
    icon: "calendar",
    fg: "var(--mv-proj-est-fg)",
    bg: "var(--mv-proj-est-bg)",
    border: "1.5px dotted var(--mv-neutral-400)"
  },
  simulado: {
    label: "Simulado",
    icon: "sparkles",
    fg: "var(--mv-proj-sim-fg)",
    bg: "var(--mv-proj-sim-bg)",
    border: "1.5px dashed var(--mv-cobalt-300)"
  }
};
const SIZES = {
  sm: {
    h: 22,
    px: 8,
    font: 11,
    icon: 12,
    gap: 4
  },
  md: {
    h: 28,
    px: 11,
    font: 12,
    icon: 14,
    gap: 5
  }
};
function ProjectionBadge({
  kind = "real",
  children,
  size = "md",
  showIcon = true,
  style,
  ...rest
}) {
  const k = KINDS[kind] || KINDS.real;
  const s = SIZES[size] || SIZES.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: s.gap,
      height: s.h,
      padding: `0 ${s.px}px`,
      borderRadius: "var(--mv-radius-sm)",
      border: k.border,
      background: k.bg,
      color: k.fg,
      fontFamily: "var(--mv-font-sans)",
      fontSize: s.font,
      fontWeight: 600,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), showIcon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: k.icon,
    size: s.icon
  }) : null, children || k.label);
}
Object.assign(__ds_scope, { ProjectionBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/money/ProjectionBadge.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.MV_ICONS = __ds_scope.MV_ICONS;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Delta = __ds_scope.Delta;

__ds_ns.MoneyDisplay = __ds_scope.MoneyDisplay;

__ds_ns.ProjectionBadge = __ds_scope.ProjectionBadge;

})();
