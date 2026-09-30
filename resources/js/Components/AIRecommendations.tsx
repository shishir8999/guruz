import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { getSignals, subscribeSignals } from "@/lib/user-signals";
import { recommendProducts } from "@/lib/recommend.functions";
import { productImage } from "@/lib/data";

interface Props {
  /** Extra product IDs to exclude (e.g. the current product on a PDP). */
  excludeIds?: string[];
  /** Optional heading override. */
  title?: string;
  limit?: number;
  scrollId?: string;
}

export function AIRecommendations({ excludeIds = [], title, limit = 8, scrollId = "ai-recs-scroll" }: Props) {
  const { lang, fmt } = useI18n();
  const cartItems = useCart((s) => s.items);
  const [signalsTick, setSignalsTick] = useState(0);

  useEffect(() => subscribeSignals(() => setSignalsTick((n) => n + 1)), []);

  const negotiate = useServerFn(recommendProducts);
  const cartProductIds = cartItems.map((i) => i.product_id);
  const signals = typeof window !== "undefined" ? getSignals() : { viewedProductIds: [], viewedCategorySlugs: [], updatedAt: 0 };

  const query = useQuery({
    queryKey: [
      "ai-recommendations",
      lang,
      limit,
      excludeIds.join(","),
      cartProductIds.join(","),
      signals.viewedProductIds.join(","),
      signalsTick,
    ],
    queryFn: () =>
      negotiate({
        data: {
          viewedProductIds: signals.viewedProductIds,
          viewedCategorySlugs: signals.viewedCategorySlugs,
          cartProductIds,
          excludeIds,
          lang: (lang as "bn" | "en" | "hi") ?? "bn",
          limit,
        },
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const heading =
    title ??
    (lang === "bn" ? "আপনার জন্য বাছাই করা" : lang === "hi" ? "आपके लिए चुना गया" : "Picked for you");

  const items = query.data?.items ?? [];
  const isLoading = query.isLoading;

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="bg-white rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-base flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <Star className="h-3.5 w-3.5" />
          </span>
          {heading}
        </h2>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          {lang === "bn" ? "হভার করলে থামবে" : "Hover to pause"}
        </span>
      </div>

      <div id={scrollId} className="overflow-hidden pb-2">
        {isLoading && (
          <div className="flex gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 basis-[45%] sm:basis-[30%] md:basis-[19%]">
                <div className="animate-pulse bg-secondary/60 rounded-lg aspect-square" />
                <div className="mt-2 h-3 w-3/4 bg-secondary/60 rounded animate-pulse" />
                <div className="mt-1 h-3 w-1/2 bg-secondary/60 rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && items.length > 0 && (
          <div className="flex gap-3 animate-marquee-left hover:[animation-play-state:paused]">
            {[...items, ...items].map((p, idx) => {
              const name = lang === "bn" ? p.name_bn : p.name_en;
              const img =
                p.main_image_url ||
                productImage({ image_hue: 210, emoji: "📦" } as never);
              const discount = p.original_price > p.price
                ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
                : 0;
              return (
                <div key={`${p.id}-${idx}`} className="shrink-0 w-[45vw] sm:w-[30vw] md:w-56">
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="group block bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative aspect-square bg-secondary overflow-hidden">
                      <img
                        src={img}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {discount > 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-[color:var(--brand-red,#e53935)] text-white text-[10px] font-bold rounded px-1.5 py-0.5">
                          -{discount}%
                        </div>
                      )}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1 rounded bg-black/60 text-white text-[10px] px-1.5 py-1 backdrop-blur-sm">
                        <Star className="h-3 w-3 shrink-0 text-amber-300" />
                        <span className="line-clamp-1">{p.reason}</span>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="text-sm line-clamp-2 min-h-[2.5rem]">{name}</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold text-[color:var(--brand-red,#e53935)]">{fmt(p.price)}</span>
                        {p.original_price > p.price && (
                          <span className="text-[11px] text-muted-foreground line-through">{fmt(p.original_price)}</span>
                        )}
                      </div>
                      {p.rating > 0 && (
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{Number(p.rating).toFixed(1)}</span>
                          <span>· {p.sold_count} sold</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}