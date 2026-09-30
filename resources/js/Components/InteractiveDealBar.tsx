import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { X, Gift, Timer } from "lucide-react";

type DealBarCfg = {
  enabled?: boolean;
  items_en?: string[];
  items_bn?: string[];
  link?: string;
  cta_bn?: string;
  cta_en?: string;
  typing_ms?: number;   // per-char typing speed
  hold_ms?: number;     // pause after finishing typing
};

const DEFAULT_EN = [
  "🎁 Order before midnight tonight and unlock a guaranteed gift!",
  "⚡ Flash Sale ends soon — up to 60% OFF on Beauty",
  "🚚 Free delivery on orders over ৳ 1000 — nationwide",
];
const DEFAULT_BN = [
  "🎁 আজ রাত ১২টার মধ্যে অর্ডার করলেই উপহার নিশ্চিত!",
  "⚡ ফ্ল্যাশ সেল শীঘ্রই শেষ — বিউটিতে ৬০% পর্যন্ত ছাড়",
  "🚚 ১০০০ টাকার উপরে অর্ডারে সারা দেশে ফ্রি ডেলিভারি",
];

const DISMISS_KEY = "guruz_deal_bar_dismissed_at";
const DISMISS_HOURS = 6;

export function InteractiveDealBar() {
  const { lang } = useI18n();
  const { data: cfg } = useQuery({
    queryKey: ["interactive_deal_bar"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await (supabase.from("app_settings") as any)
        .select("value").eq("key", "interactive_deal_bar").maybeSingle();
      return (data?.value ?? null) as DealBarCfg | null;
    },
  });

  const items = useMemo(() => {
    return lang === "bn"
      ? (cfg?.items_bn?.length ? cfg.items_bn : DEFAULT_BN)
      : (cfg?.items_en?.length ? cfg.items_en : DEFAULT_EN);
  }, [lang, cfg]);

  const typingSpeed = cfg?.typing_ms ?? 45;
  const hold = cfg?.hold_ms ?? 2200;
  const ctaLabel = lang === "bn" ? (cfg?.cta_bn ?? "কিনতে যান") : (cfg?.cta_en ?? "Shop now");
  const link = cfg?.link || "/products";

  const [dismissed, setDismissed] = useState(true);
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">("typing");

  // Init dismissed state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) { setDismissed(false); return; }
    const ts = Number(raw);
    if (!ts || Date.now() - ts > DISMISS_HOURS * 3600_000) {
      setDismissed(false);
    }
  }, []);

  // Typewriter loop
  useEffect(() => {
    if (dismissed || items.length === 0) return;
    const current = items[idx % items.length] ?? "";

    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), typingSpeed);
      } else {
        t = setTimeout(() => setPhase("holding"), hold);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("erasing"), 200);
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(current.slice(0, text.length - 1)), Math.max(15, typingSpeed / 2));
      } else {
        t = setTimeout(() => {
          setIdx((i) => (i + 1) % items.length);
          setPhase("typing");
        }, 250);
      }
    }
    return () => clearTimeout(t);
  }, [text, phase, idx, items, typingSpeed, hold, dismissed]);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setDismissed(true);
  };

  if (cfg?.enabled === false) return null;
  if (dismissed) return null;
  if (items.length === 0) return null;

  return (
    <div
      className="sticky top-0 z-40 w-full animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 text-white shadow-lg">
        {/* Shine sweep */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md"
          style={{ animation: "deal-shine 3.5s linear infinite" }}
        />

        <div className="relative mx-auto flex h-[28px] sm:h-[32px] max-w-7xl items-center gap-2 px-2 sm:gap-3 sm:px-4">
          <div className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2 py-[1px] text-[9px] font-bold uppercase tracking-wider backdrop-blur leading-none">
            <Gift className="h-3 w-3 animate-pulse" />
            {lang === "bn" ? "লাইভ ডিল" : "Live Deal"}
          </div>
          <Gift className="h-3 w-3 shrink-0 sm:hidden" />

          <div className="min-w-0 flex-1 truncate text-[10px] font-semibold sm:text-[11px] leading-tight">
            <span className="align-middle">{text}</span>
            <span
              aria-hidden
              className="ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[1px] bg-white"
              style={{ animation: "deal-caret 1s steps(1) infinite" }}
            />
          </div>

          <a
            href={link}
            className="hidden shrink-0 items-center gap-1 rounded-full bg-white/95 px-2 py-[1px] text-[10px] font-bold text-fuchsia-700 shadow-sm transition hover:bg-white sm:inline-flex sm:text-[10px] leading-none"
          >
            <Timer className="h-3 w-3" />
            {ctaLabel}
          </a>
          <a
            href={link}
            className="shrink-0 rounded-full bg-white/95 px-2 py-[1px] text-[9px] font-bold text-fuchsia-700 shadow-sm sm:hidden leading-none"
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </a>

          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-0.5 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        <style>{`
          @keyframes deal-shine {
            0% { transform: translateX(0); }
            100% { transform: translateX(400%); }
          }
          @keyframes deal-caret {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}