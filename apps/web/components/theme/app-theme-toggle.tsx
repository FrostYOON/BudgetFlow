"use client";

import { MonitorCog, MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "budgetflow-theme";
const THEME_OPTIONS: Array<{
  description: string;
  icon: typeof MonitorCog;
  label: string;
  value: ThemePreference;
}> = [
  {
    value: "system",
    label: "Auto",
    description: "Follow your device mode.",
    icon: MonitorCog,
  },
  {
    value: "light",
    label: "Light",
    description: "Bright surfaces for daytime use.",
    icon: SunMedium,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Low-glare surfaces for evening use.",
    icon: MoonStar,
  },
];

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

function useThemePreference() {
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

  const updateTheme = (nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return { theme, updateTheme };
}

export function AppThemeQuickToggle() {
  const { theme, updateTheme } = useThemePreference();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[color:var(--surface-border)] bg-[color:var(--surface-soft)] p-1 shadow-[var(--surface-shadow)]">
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => updateTheme(option.value)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] ${
              isActive
                ? "bg-[color:var(--selection-bg)] text-[color:var(--selection-fg)] shadow-[var(--selection-shadow)]"
                : "text-[color:var(--text-soft)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--foreground)]"
            }`}
            aria-label={`Switch theme to ${option.label}`}
            aria-pressed={isActive}
            title={option.label}
          >
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </button>
        );
      })}
    </div>
  );
}

export function AppThemeSetting() {
  const { theme, updateTheme } = useThemePreference();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateTheme(option.value)}
              className={`rounded-[1.35rem] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] ${
                isActive
                  ? "border-[color:var(--selection-bg)] bg-[color:var(--selection-bg)] text-[color:var(--selection-fg)] shadow-[var(--selection-shadow)]"
                  : "border-[color:var(--surface-border)] bg-[color:var(--surface-soft)] text-[color:var(--foreground)] shadow-[var(--surface-shadow)] hover:bg-[color:var(--surface-muted)]"
              }`}
              aria-pressed={isActive}
            >
              <span className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                    isActive
                      ? "border border-white/20 bg-white/15 text-[color:var(--foreground)]"
                      : "bg-[color:var(--surface-muted)] text-current"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    isActive
                      ? "border border-white/20 bg-white/15 text-[color:var(--foreground)]"
                      : "bg-[color:var(--surface-muted)] text-[color:var(--text-soft)]"
                  }`}
                >
                  {isActive ? "Selected" : "Theme"}
                </span>
              </span>
              <p className="mt-4 text-sm font-semibold">{option.label}</p>
              <p
                className={`mt-1 text-sm leading-6 ${
                  isActive ? "text-current/80" : "text-[color:var(--text-muted)]"
                }`}
              >
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
      <p className="text-sm text-slate-500">
        Auto follows your device setting. Light and Dark stay fixed until you change them here.
      </p>
    </div>
  );
}
