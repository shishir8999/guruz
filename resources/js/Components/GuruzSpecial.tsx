import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

type Cfg = {
  enabled?: boolean;
  title_en?: string;
  title_bn?: string;
  subtitle_en?: string;
  subtitle_bn?: string;
  gradient_from?: string;
  gradient_to?: string;
  emoji?: string;
  product_ids?: string[];
};

export function GuruzSpecial({ products }: { products: Product[] }) {
  const { lang } = useI18n();
  const { data: cfg } = useQuery({
    queryKey: ["guruz_special_public"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await (supabase.from("app_settings") as any)
        .select("value")
        .eq("key", "guruz_special")
        .maybeSingle();
      return (data?.value ?? null) as Cfg | null;
    },
  });

  if (!cfg || cfg.enabled === false) return null;
  const ids = cfg.product_ids ?? [];
  if (ids.length === 0) return null;
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = ids.map((id) => byId.get(id)).filter(Boolean) as Product[];
  if (items.length === 0) return null;

  const from = cfg.gradient_from || "#7c3aed";
  const to = cfg.gradient_to || "#db2777";
  const title =
    (lang === "bn" ? cfg.title_bn : cfg.title_en) ||
    (lang === "bn" ? "গুরুজ স্পেশাল" : "Guruz Special");
  const subtitle = lang === "bn" ? cfg.subtitle_bn : cfg.subtitle_en;
  const emoji = cfg.emoji || "🎁";

  return (
    <section
      className="rounded-xl p-1.5 sm:p-2"
      style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
    >
      <div className="flex items-center justify-between text-white mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base leading-none">{emoji}</span>
          <div className="min-w-0">
            <h2 className="font-bold text-xs sm:text-sm truncate">{title}</h2>
            {subtitle && (
              <p className="text-[10px] text-white/85 truncate leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
        <Link
          to="/products"
          className="shrink-0 text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
        >
          {lang === "bn" ? "সব দেখুন" : "See all"} <ChevronRight className="inline w-3 h-3" />
        </Link>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5 sm:gap-2">
          {items.map((p) => (
            <div key={p.id} className="shrink-0 w-24 sm:w-32">
              <ProductCard product={p} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}