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
