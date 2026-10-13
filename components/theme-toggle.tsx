"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { getServerThemeSnapshot, getThemeSnapshot, setTheme, subscribeTheme } from "@/lib/theme";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${nextTheme} mode`;

  return (
    <button type="button" className="theme-toggle" onClick={() => setTheme(nextTheme)} aria-label={label} title={label}>
      <Sun className="theme-toggle__sun" size={17} aria-hidden="true" />
      <Moon className="theme-toggle__moon" size={17} aria-hidden="true" />
    </button>
  );
}
