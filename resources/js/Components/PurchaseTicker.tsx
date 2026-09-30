import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { ShoppingBag, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Event = {
  id: string;
  buyer_name: string;
  product_name: string;
  product_slug: string | null;
  product_id: string | null;
  city: string | null;
  is_real: boolean;
  created_at: string;
};

/** Cities per region — used to filter seeded events + label real events sensibly. */
const BD_CITIES = [
  "Dhaka", "Chittagong", "Chattogram", "Khulna", "Rajshahi", "Sylhet",
  "Barishal", "Barisal", "Rangpur", "Mymensingh", "Comilla", "Cumilla",
  "Narayanganj", "Gazipur", "Bogura", "Jessore", "Jashore", "Cox's Bazar",
  "ঢাকা", "চট্টগ্রাম", "খুলনা", "রাজশাহী", "সিলেট", "বরিশাল", "রংপুর", "ময়মনসিংহ",
];
const IN_CITIES = [
  "Mumbai", "Delhi", "New Delhi", "Bengaluru", "Bangalore", "Hyderabad",
  "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Surat",
  "Kanpur", "Nagpur", "Indore", "Bhopal", "Patna", "Kochi", "Coimbatore",
  "Guwahati", "Bhubaneswar", "Chandigarh", "Noida", "Gurgaon", "Gurugram",
  "मुंबई", "दिल्ली", "बेंगलुरु", "हैदराबाद", "चेन्नई", "कोलकाता", "पुणे", "जयपुर",
];

function cityMatchesRegion(city: string | null, region: "BD" | "IN" | "OTHER"): boolean {
  if (!city) return true; // unknown city → allow everywhere
  const c = city.trim();
  const inBD = BD_CITIES.some((x) => c.toLowerCase() === x.toLowerCase());
  const inIN = IN_CITIES.some((x) => c.toLowerCase() === x.toLowerCase());
  if (region === "IN") return inIN || (!inBD && !inIN);
  if (region === "BD") return inBD || (!inBD && !inIN);
  return true;
}

function relativeTime(iso: string, lang: "bn" | "en" | "hi") {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) {
    if (lang === "bn") return "এইমাত্র";
    if (lang === "hi") return "अभी-अभी";
    return "just now";
  }
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) {
    if (lang === "bn") return `${mins} মিনিট আগে`;
    if (lang === "hi") return `${mins} मिनट पहले`;
    return `${mins} min ago`;
  }
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) {
    if (lang === "bn") return `${hrs} ঘণ্টা আগে`;
    if (lang === "hi") return `${hrs} घंटे पहले`;
    return `${hrs}h ago`;
  }
  const days = Math.floor(hrs / 24);
  if (lang === "bn") return `${days} দিন আগে`;
  if (lang === "hi") return `${days} दिन पहले`;
  return `${days}d ago`;
}

/**
 * Bottom-left toast card that cycles through recent purchases.
 * - Fetches the latest 30 purchase events (mix of real + seeded).
 * - Live-subscribes to inserts and puts new ones at the front of the queue.
 * - Shows one card at a time for ~5s, hides for ~4s, then shows the next.
 */
export function PurchaseTicker() {
  const { lang, t, region } = useI18n();
  const [events, setEvents] = useState<Event[]>([]);
  const [current, setCurrent] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const idxRef = useRef(0);

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await (supabase as any).rpc("get_recent_purchase_feed", { _limit: 30 });
      if (!mounted) return;
      const rows = (data as Event[] | null) ?? [];
      // Keep real events always; filter seeded/fake ones to the visitor's region
      const filtered = rows.filter((r) => r.is_real || cityMatchesRegion(r.city, region));
      const shuffled = filtered.slice().sort(() => Math.random() - 0.5);
      setEvents(shuffled);
    })();
    return () => {
      mounted = false;
    };
  }, [region]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("purchase-ticker")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "purchase_events" },
        (payload) => {
          const row = payload.new as Event;
          setEvents((prev) => [row, ...prev].slice(0, 60));
          // Force-show the newest real event immediately
          if (row.is_real) {
            setCurrent(row);
            setVisible(true);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Cycle timer
  useEffect(() => {
    if (dismissed || events.length === 0) return;
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    const showNext = () => {
      const next = events[idxRef.current % events.length];
      idxRef.current += 1;
      setCurrent(next);
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        showTimer = setTimeout(showNext, 4000);
      }, 5000);
    };

    // first show after 2s
    showTimer = setTimeout(showNext, 2000);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [events, dismissed]);

  if (dismissed || !current) return null;

  const linkContent = (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-9 h-9 rounded-full bg-[color:var(--brand-orange,#f97316)]/10 text-[color:var(--brand-orange,#f97316)] flex items-center justify-center">
        <ShoppingBag className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold">{current.buyer_name}</span>
          {current.city ? <span className="text-gray-500"> · {current.city}</span> : null}
          <br />
          <span className="text-gray-600">{t("just_bought")}</span>{" "}
          <span className="font-medium text-gray-900 line-clamp-1">{current.product_name}</span>
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{relativeTime(current.created_at, lang)}</p>
      </div>
    </div>
  );

  return (
    <div
      className={`fixed left-3 z-40 bottom-24 sm:left-6 sm:bottom-10 max-w-[92vw] sm:max-w-sm transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-live="polite"
    >
      <div className="relative bg-white rounded-xl shadow-xl border border-black/5 p-3 pr-8">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        {current.product_id ? (
          <Link to="/product/$id" params={{ id: current.product_id }} className="block">
            {linkContent}
          </Link>
        ) : (
          linkContent
        )}
      </div>
    </div>
  );
}