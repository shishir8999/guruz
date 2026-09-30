import { useEffect, useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { PartyPopper, X } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { usePage } from "@inertiajs/react";

const DISMISS_KEY_PREFIX = "welcome_countdown_dismissed_v2_";
const DURATION_MS = 15 * 60 * 1000; // 15 minutes

type Copy = { message: string; cta: string; code: string; m: string; s: string };

const copy: Record<Lang, Copy> = {
  bn: {
    message:
      "অভিনন্দন! GURUZ পরিবারে আপনাকে স্বাগতম। আগামী ১৫ মিনিটের মধ্যে আপনার প্রথম অর্ডারটি কনফার্ম করলে পাবেন স্পেশাল ১০% ডিসকাউন্ট!",
    cta: "এখনই অর্ডার করুন",
    code: "WELCOME10",
    m: "মিনিট",
    s: "সেকেন্ড",
  },
  en: {
    message:
      "Congratulations! Welcome to the GURUZ family. Confirm your first order within the next 15 minutes and get a special 10% discount!",
    cta: "Order now",
    code: "WELCOME10",
    m: "Min",
    s: "Sec",
  },
  hi: {
    message:
      "बधाई हो! GURUZ परिवार में आपका स्वागत है। अगले 15 मिनट में अपना पहला ऑर्डर कन्फर्म करें और पाएँ स्पेशल 10% छूट!",
    cta: "अभी ऑर्डर करें",
    code: "WELCOME10",
    m: "मिनट",
    s: "सेकंड",
  },
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function WelcomeCountdown() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const createdAt = useMemo(() => {
    if (!user?.created_at) return null;
    const t = Date.parse(user.created_at);
    return Number.isNaN(t) ? null : t;
  }, [user?.created_at]);

  const endAt = createdAt ? createdAt + DURATION_MS : null;
  const dismissKey = user ? DISMISS_KEY_PREFIX + user.id : null;

  const { url } = usePage();
  const isProfile = url.startsWith('/account');

  useEffect(() => {
    setMounted(true);
    // Removed local storage check so it always appears if timer is active, 
    // or we can keep session storage. We just won't hide it permanently.
  }, [dismissKey]);

  useEffect(() => {
    if (!endAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [endAt]);

  if (!mounted || !user || !endAt) return null;
  // If dismissed AND not on profile, hide it. (So it remains visible in profile)
  if (dismissed && !isProfile) return null;
  const remaining = endAt - now;
  if (remaining <= 0) return null;

  const dismiss = () => {
    setDismissed(true);
    // We intentionally don't save to localStorage so it's not permanently hidden.
  };

  const c = copy[lang];
  const totalSec = Math.floor(remaining / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[95] flex justify-center px-1 pt-1 animate-in slide-in-from-top-4 fade-in sm:px-2 sm:pt-1"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-md border border-primary/30 bg-gradient-to-r from-primary via-primary to-primary/85 px-2 py-1 pr-6 text-primary-foreground shadow-2xl sm:px-3">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-1 top-0.5 rounded-full p-1 text-primary-foreground/80 transition hover:bg-white/15 hover:text-primary-foreground"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
              <PartyPopper className="h-3 w-3" />
            </div>
            <div
              className="flex items-center gap-0.5 rounded bg-white/15 px-1 py-0.5 font-mono text-[10px] font-bold tabular-nums"
              aria-label={`${pad(m)} ${c.m} ${pad(s)} ${c.s}`}
            >
              <span>{pad(m)}</span>
              <span className="opacity-70">:</span>
              <span className="animate-pulse">{pad(s)}</span>
            </div>
          </div>

          <p className="min-w-0 flex-1 text-[10px] leading-tight sm:text-[11px]">
            {c.message}
          </p>

          <Link
            href="/"
            onClick={dismiss}
            className="shrink-0 self-start rounded bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary shadow transition hover:bg-white/90 sm:self-auto"
          >
            {c.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}