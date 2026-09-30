import { useEffect, useState } from "react";
import { ShoppingBag, X, CheckCircle2, Store, ExternalLink } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";
import { playNotificationSound } from "@/lib/notificationSound";

interface PurchaseEvent {
  id: string;
  customer_name: string;
  city: string;
  shop_name: string;
  product_name: string;
  product_image?: string;
  product_url?: string;
  time_ago: string;
  is_real?: boolean;
}

const FALLBACK_PURCHASES: PurchaseEvent[] = [
  {
    id: "f1",
    customer_name: "তানভীর আহমেদ",
    city: "ঢাকা",
    shop_name: "Spark Cables",
    product_name: "স্পার্ক ১.৫ আরএম সিঙ্গেল কোর ক্যাবল",
    product_url: "/products",
    time_ago: "১ মিনিট পূর্বে",
  },
  {
    id: "f2",
    customer_name: "মেহেদী হাসান",
    city: "চট্টগ্রাম",
    shop_name: "Guruz BD Official",
    product_name: "গুরুজ প্রিমিয়াম মাল্টিপ্লাগ এক্সটেনশন",
    product_url: "/products",
    time_ago: "৩ মিনিট পূর্বে",
  },
  {
    id: "f3",
    customer_name: "শফিকুল ইসলাম",
    city: "সিলেট",
    shop_name: "Spark Cables",
    product_name: "স্পার্ক ২.৫ আরএম পিভিসি ইনসুলেটেড তার",
    product_url: "/products",
    time_ago: "৫ মিনিট পূর্বে",
  },
  {
    id: "f4",
    customer_name: "ফারহানা ইয়াসমিন",
    city: "রাজশাহী",
    shop_name: "Cable World",
    product_name: "৪.০ আরএম হেভি ডিউটি পাওয়ার ক্যাবল",
    product_url: "/products",
    time_ago: "৭ মিনিট পূর্বে",
  },
  {
    id: "f5",
    customer_name: "কামরুল হাসান",
    city: "খুলনা",
    shop_name: "Spark Cables",
    product_name: "স্পার্ক প্রিমিয়াম সুইচ ও সকেট বোর্ড",
    product_url: "/products",
    time_ago: "১০ মিনিট পূর্বে",
  },
];

const DISMISS_KEY = "live_visitor_hidden_v3";

export function LiveVisitorCounter() {
  const { props } = usePage<any>();
  const widgetConfig = props?.siteSettings?.visitor_widget;

  const isActive = widgetConfig?.is_active ?? true;
  const intervalSec = widgetConfig?.interval_seconds ?? 6;
  const displaySec = widgetConfig?.display_duration_seconds ?? 6;

  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [visible, setVisible] = useState(false);
  const [feed, setFeed] = useState<PurchaseEvent[]>(FALLBACK_PURCHASES);
  const [feedIdx, setFeedIdx] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    try {
      if (window.localStorage.getItem(DISMISS_KEY)) setHidden(true);
    } catch {}

    // Fetch dynamic recent purchases from backend API
    fetch("/api/recent-purchases", {
      headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
          setFeed(data.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mounted || hidden || !isActive || feed.length === 0) return;

    // Initial popup display
    const firstTimer = setTimeout(() => {
      setVisible(true);
    }, 2500);

    // Periodic cycling loop
    const loopTimeMs = (intervalSec + displaySec) * 1000;
    const intervalTimer = setInterval(() => {
      setFeedIdx((prev) => (prev + 1) % feed.length);
      setVisible(true);
    }, loopTimeMs);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(intervalTimer);
    };
  }, [mounted, hidden, isActive, intervalSec, displaySec, feed.length]);

  // Hide toast after display duration & play chime on appearance
  useEffect(() => {
    if (!visible) return;

    // 🔔 Play pleasant Messenger / WhatsApp notification chime
    playNotificationSound('messenger');

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, displaySec * 1000);

    return () => clearTimeout(hideTimer);
  }, [visible, feedIdx, displaySec]);

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setHidden(true);
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (!mounted || hidden || !isActive || !visible || feed.length === 0) return null;

  const current = feed[feedIdx % feed.length];
  const hasValidImage = Boolean(
    current?.product_image &&
    current.product_image.trim() !== '' &&
    current.product_image !== '/storage/' &&
    current.product_image !== '/storage' &&
    !failedImages[current.id]
  );

  return (
    <div
      className="fixed left-3 bottom-20 z-[75] w-[350px] max-w-[calc(100vw-1.5rem)] animate-in slide-in-from-left-4 fade-in duration-300 sm:left-4 sm:bottom-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md dark:bg-slate-900/95 dark:border-emerald-500/30 transition-all hover:border-emerald-500 hover:shadow-emerald-500/20 group">
        
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        <div className="flex items-start gap-3 pt-0.5">
          {/* Left Thumbnail or Shopping Icon */}
          <div className="relative shrink-0">
            {hasValidImage ? (
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-xs">
                <img
                  key={current.id}
                  src={current.product_image}
                  alt={current.product_name}
                  className="w-full h-full object-cover"
                  onError={() => {
                    setFailedImages((prev) => ({ ...prev, [current.id]: true }));
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                <ShoppingBag className="w-6 h-6" />
              </div>
            )}

            {/* Glowing Live Pulse Dot */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </span>
          </div>

          {/* Right Info Section */}
          <div className="flex-1 min-w-0 pr-5 space-y-1 text-xs">
            {/* Header Line: Customer Name & Time */}
            <div className="flex items-center justify-between gap-1">
              <p className="font-extrabold text-slate-900 dark:text-white truncate">
                {current.customer_name} <span className="font-medium text-[11px] text-slate-500 dark:text-slate-400">({current.city})</span>
              </p>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                {current.time_ago}
              </span>
            </div>

            {/* Shop Name */}
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1 truncate">
              <Store size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
              <span>শপ: <strong className="text-purple-700 dark:text-purple-300 font-black">{current.shop_name}</strong></span>
            </p>

            {/* Product Name */}
            <p className="text-xs text-slate-800 dark:text-slate-100 font-bold line-clamp-1">
              🛍️ <span className="hover:text-emerald-600 transition-colors">{current.product_name}</span>
            </p>

            {/* Verified Badge & Link */}
            <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 size={11} className="shrink-0" />
                <span>অর্ডার সম্পন্ন হয়েছে</span>
              </span>

              {current.product_url && (
                <Link
                  href={current.product_url}
                  className="font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center gap-0.5 group-hover:underline"
                >
                  <span>দেখুন</span>
                  <ExternalLink size={10} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Close / Dismiss Button */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}