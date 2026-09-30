import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchActiveSeasonalTheme } from "@/lib/seasonal-themes";
import { useI18n } from "@/lib/i18n";

/**
 * Top-of-page seasonal greeting banner. Renders only when the active theme
 * has `banner_enabled` and a title/message. Dismissible per session.
 */
export function SeasonalBanner() {
  const { data: theme } = useQuery({
    queryKey: ["active_seasonal_theme"],
    queryFn: fetchActiveSeasonalTheme,
    staleTime: 60_000,
  });
  const { lang } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  const storageKey = theme ? `seasonal_banner_dismissed_${theme.id}` : "";
  useEffect(() => {
    if (!storageKey) return;
    try {
      setDismissed(sessionStorage.getItem(storageKey) === "1");
    } catch { /* ignore */ }
  }, [storageKey]);

  if (!theme || !theme.banner_enabled || dismissed) return null;

  const title = (lang === "bn" ? theme.banner_title_bn : theme.banner_title_en) || theme.banner_title_en || theme.name_en;
  const message = (lang === "bn" ? theme.banner_message_bn : theme.banner_message_en) || theme.banner_message_en;
  if (!title && !message) return null;

  const tint = theme.tint_color || "#f97316";

  return (
    <div
      className="relative w-full text-white shadow-md"
      style={{
        background: `linear-gradient(90deg, ${tint} 0%, ${tint}dd 60%, ${tint}aa 100%)`,
      }}
      role="region"
      aria-label="Seasonal announcement"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 py-2 text-sm">
        <span className="text-lg leading-none">{theme.icon}</span>
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {title && <span className="font-bold truncate">{title}</span>}
          {message && <span className="opacity-95 truncate">{message}</span>}
        </div>
        {theme.banner_cta_url && theme.banner_cta_label && (
          <a
            href={theme.banner_cta_url}
            className="hidden sm:inline-flex items-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur px-3 py-1 text-xs font-semibold transition"
          >
            {theme.banner_cta_label}
          </a>
        )}
        <button
          onClick={() => {
            setDismissed(true);
            try { sessionStorage.setItem(storageKey, "1"); } catch { /* ignore */ }
          }}
          className="p-1 rounded-full hover:bg-white/20 transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}