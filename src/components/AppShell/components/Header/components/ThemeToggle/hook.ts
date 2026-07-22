import { useEffect, useState } from "react";
import { flipTheme, normalizeTheme, type Theme } from "./theme.helper";

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
    } catch {}
    setTheme(next);
  };

  return { theme, toggle };
}
