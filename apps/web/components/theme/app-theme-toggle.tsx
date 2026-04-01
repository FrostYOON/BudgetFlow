"use client";

import { MonitorCog, MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "budgetflow-theme";
const THEME_ORDER: ThemePreference[] = ["system", "dark", "light"];

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const colorMode = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

  root.dataset.theme = theme;
  root.dataset.colorMode = colorMode;
}

function getThemeMeta(theme: ThemePreference) {
  switch (theme) {
    case "dark":
      return { label: "Dark", icon: MoonStar };
    case "light":
      return { label: "Light", icon: SunMedium };
    default:
      return { label: "Auto", icon: MonitorCog };
  }
}

export function AppThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const meta = getThemeMeta(theme);
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => {
        const currentIndex = THEME_ORDER.indexOf(theme);
        const nextTheme = THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];

        setTheme(nextTheme);
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--surface-shadow)] transition hover:bg-[color:var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)]"
      aria-label={`Theme mode ${meta.label}. Click to cycle theme.`}
      title={`Theme: ${meta.label}`}
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} />
      <span>{meta.label}</span>
    </button>
  );
}
