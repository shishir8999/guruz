import { useEffect } from "react";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useI18n } from "@/lib/i18n";

const DARK_SURFACE_OVERRIDES: Record<string, string> = {
  background: "oklch(0.129 0.042 264.695)",
  foreground: "oklch(0.984 0.003 247.858)",
  card: "oklch(0.208 0.042 265.755)",
  card_foreground: "oklch(0.984 0.003 247.858)",
  popover: "oklch(0.208 0.042 265.755)",
  popover_foreground: "oklch(0.984 0.003 247.858)",
  secondary: "oklch(0.279 0.041 260.031)",
  secondary_foreground: "oklch(0.984 0.003 247.858)",
  muted: "oklch(0.279 0.041 260.031)",
  muted_foreground: "oklch(0.704 0.04 256.788)",
  accent: "oklch(0.279 0.041 260.031)",
  accent_foreground: "oklch(0.984 0.003 247.858)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 15%)",
  ring: "oklch(0.551 0.027 264.364)",
  sidebar: "oklch(0.208 0.042 265.755)",
  sidebar_foreground: "oklch(0.984 0.003 247.858)",
  sidebar_accent: "oklch(0.279 0.041 260.031)",
  sidebar_accent_foreground: "oklch(0.984 0.003 247.858)",
  sidebar_border: "oklch(1 0 0 / 10%)",
};

const VAR_MAP: Record<string, string> = {
  primary: "--primary",
  primary_dark: "--primary-dark",
  primary_foreground: "--primary-foreground",
  brand_navy: "--brand-navy",
  brand_teal: "--brand-teal",
  brand_orange: "--brand-orange",
  brand_red: "--brand-red",
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  card_foreground: "--card-foreground",
  popover: "--popover",
  popover_foreground: "--popover-foreground",
  secondary: "--secondary",
  secondary_foreground: "--secondary-foreground",
  muted: "--muted",
  muted_foreground: "--muted-foreground",
  accent: "--accent",
  accent_foreground: "--accent-foreground",
  destructive: "--destructive",
  destructive_foreground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  sidebar: "--sidebar",
  sidebar_foreground: "--sidebar-foreground",
  sidebar_primary: "--sidebar-primary",
  sidebar_primary_foreground: "--sidebar-primary-foreground",
  sidebar_accent: "--sidebar-accent",
  sidebar_accent_foreground: "--sidebar-accent-foreground",
  sidebar_border: "--sidebar-border",
  header_bg: "--header-bg",
  header_fg: "--header-fg",
  footer_bg: "--footer-bg",
  footer_fg: "--footer-fg",
  announcement_bg: "--announcement-bg",
  announcement_fg: "--announcement-fg",
  notice_bg_from: "--notice-bg-from",
  notice_bg_via: "--notice-bg-via",
  notice_bg_to: "--notice-bg-to",
  notice_fg: "--notice-fg",
  search_bar_bg: "--search-bar-bg",
  search_bar_fg: "--search-bar-fg",
};

/** Applies admin-configured brand colors as CSS variables on <html>. */
export function ThemeApplier() {
  const s = useSiteSettings();
  const c = s.theme_colors;
  const { lang } = useI18n();
  const key = c ? JSON.stringify(c) : "";
  useEffect(() => {
    if (typeof document === "undefined" || !c) return;
    const root = document.documentElement;
    const applyThemeVars = () => {
      const darkMode = root.classList.contains("dark");
      for (const [k, cssVar] of Object.entries(VAR_MAP)) {
        const v = darkMode
          ? DARK_SURFACE_OVERRIDES[k] ?? (c as Record<string, string | undefined>)[k]
          : (c as Record<string, string | undefined>)[k];
        if (v) root.style.setProperty(cssVar, v);
      }
    };

    applyThemeVars();
    const observer = new MutationObserver(applyThemeVars);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Sync browser tab title from site settings.
  useEffect(() => {
    if (typeof document === "undefined" || !s.isLoaded) return;
    const title = lang === "bn" ? s.site_title_bn : s.site_title_en;
    if (title) document.title = title;
  }, [s.isLoaded, s.site_title_en, s.site_title_bn, lang]);

  // Sync favicon from site settings.
  useEffect(() => {
    if (typeof document === "undefined" || !s.isLoaded) return;
    const href = s.favicon_url;
    if (!href) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [s.isLoaded, s.favicon_url]);

  return null;
}