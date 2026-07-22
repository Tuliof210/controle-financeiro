export type Theme = "light" | "dark";

export function normalizeTheme(value: string | null): Theme {
  return value === "dark" ? "dark" : "light";
}

export function flipTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}
