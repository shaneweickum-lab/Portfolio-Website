"use client";

import { Moon, Sun } from "lucide-react";
import { useIsDarkMode } from "@/hooks/use-is-dark-mode";

export function ThemeToggle() {
  const isDark = useIsDarkMode();

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-signal hover:text-foreground"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
