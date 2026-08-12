import { useEffect, useState } from "react";
import {
  flipTheme,
  iconFor,
  normalizeTheme,
  type Theme,
  toggleLabel,
} from "./theme.helper.ts";

export function useThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(
      normalizeTheme(document.documentElement.getAttribute("data-theme")),
    );
  }, []);

  const toggle = () => {
    const current = normalizeTheme(
      document.documentElement.getAttribute("data-theme"),
    );
    const next = flipTheme(current);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked: the theme still flips for this session.
    }
    setTheme(next);
  };

  return { theme, toggle, ariaLabel: toggleLabel(theme), icon: iconFor(theme) };
}
