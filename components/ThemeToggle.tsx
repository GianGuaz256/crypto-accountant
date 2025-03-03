"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
    >
      {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  );
} 