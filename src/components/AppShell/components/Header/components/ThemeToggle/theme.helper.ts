export type Theme = "light" | "dark";

export function normalizeTheme(value: string | null): Theme {
  if (value === "dark") {
    return "dark";
  }
  return "light";
}

export function flipTheme(current: Theme): Theme {
  if (current === "dark") {
    return "light";
  }
  return "dark";
}

// The button says what it will DO, so its label names the theme it switches to.
export function toggleLabel(current: Theme | null): string {
  if (current === "dark") {
    return "Ativar tema claro";
  }
  return "Ativar tema escuro";
}

// `null` is the pre-hydration state: an empty slot the same size as the icon,
// so the header does not shift when the real theme arrives.
export type ThemeIcon = "none" | "sun" | "moon";

export function iconFor(current: Theme | null): ThemeIcon {
  if (current === null) {
    return "none";
  }
  if (current === "dark") {
    return "sun";
  }
  return "moon";
}
