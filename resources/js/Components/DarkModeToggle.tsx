import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "guruz_theme_mode"; // "dark" | "light"

function applyMode(mode: "dark" | "light") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = mode;
}

export function initDarkMode() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(STORAGE_KEY) as "dark" | "light" | null;
  const prefers = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  applyMode(saved ?? (prefers ? "dark" : "light"));
}

type Props = { className?: string; compact?: boolean };

export function DarkModeToggle({ className = "", compact = false }: Props) {
  const [mode, setMode] = useState<"dark" | "light">("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY) as "dark" | "light" | null;
    const prefers = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const initial = saved ?? (prefers ? "dark" : "light");
    setMode(initial);
    applyMode(initial);
  }, []);

  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyMode(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  };

  const isDark = mode === "dark";
  const sizeCls = compact ? "h-7 w-12" : "h-8 w-14";
  const knobCls = compact ? "h-5 w-5" : "h-6 w-6";
  const iconSize = compact ? 12 : 14;

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative inline-flex ${sizeCls} shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[color:var(--brand-orange,#f97316)] ${
        isDark
          ? "bg-gradient-to-r from-indigo-900 to-slate-900"
          : "bg-gradient-to-r from-amber-300 to-orange-400"
      } ${className}`}
    >
      <span
        className={`absolute inset-y-0.5 left-0.5 flex ${knobCls} items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-full" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon size={iconSize} className="text-indigo-700" fill="currentColor" />
        ) : (
          <Sun size={iconSize} className="text-amber-500" />
        )}
      </span>
    </button>
  );
}