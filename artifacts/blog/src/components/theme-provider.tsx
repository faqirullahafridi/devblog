import { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Apply theme on `<html>` immediately — no color transition flash (mobile/iPad). */
function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  if (next === "dark") {
    root.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    root.classList.remove("dark");
    localStorage.theme = "light";
  }
  // Force synchronous style recalc before re-enabling transitions
  void root.offsetHeight;
  root.classList.remove("theme-switching");
}

function readStoredTheme(): Theme {
  if (localStorage.theme === "dark") return "dark";
  if (localStorage.theme === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return readStoredTheme();
  });

  useEffect(() => {
    applyTheme(readStoredTheme());
    setTheme(readStoredTheme());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-theme={theme} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
