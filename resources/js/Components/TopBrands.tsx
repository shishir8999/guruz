import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { cdnImage } from "@/lib/img";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/Components/ui/carousel";

type Shop = {
  id: string;
  slug: string;
  name_en: string;
  name_bn?: string | null;
  logo_url?: string | null;
};

export function TopBrands({ shops }: { shops: Shop[] }) {
  const { lang } = useI18n();
  const { data: cfg } = useQuery({
    queryKey: ["top_brands_public"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await (supabase.from("app_settings") as any)
        .select("value")
        .eq("key", "top_brands")
        .maybeSingle();
      return (data?.value ?? null) as { enabled?: boolean; shop_ids?: string[] } | null;
    },
  });

  if (!cfg || cfg.enabled === false) return null;
  const ids = cfg.shop_ids ?? [];
  if (ids.length === 0) return null;
  const byId = new Map(shops.map((s) => [s.id, s]));
  const items = ids.map((id) => byId.get(id)).filter(Boolean) as Shop[];
  if (items.length === 0) return null;

  return (
    <section className="rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 p-1.5 sm:p-2">
      <div className="flex items-center justify-between text-white mb-1.5">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-yellow-100" />
          <h2 className="font-bold text-xs sm:text-sm">
            {lang === "bn" ? "টপ ব্র্যান্ড" : "Top Brands"}
          </h2>
        </div>
        <Link
          to="/shops"
          className="text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
        >
          {lang === "bn" ? "সব দেখুন" : "See all"} <ChevronRight className="inline w-3 h-3" />
        </Link>
      </div>
      <div className="rounded-lg bg-white/95 p-2">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 sm:-ml-4">
            {items.map((s) => (
              <CarouselItem key={s.id} className="basis-auto pl-3 sm:pl-4">
                <Link
                  to="/shop/$slug"
                  params={{ slug: s.slug }}
                  className="w-16 sm:w-20 flex flex-col items-center gap-1 text-center"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full ring-2 ring-amber-300 bg-white overflow-hidden grid place-items-center text-lg font-bold text-amber-600 shadow">
                    {s.logo_url ? (
                      <img
                        src={cdnImage(s.logo_url, { width: 128 })}
                        alt={s.name_en}
                        width={64}
                        height={64}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      s.name_en.charAt(0)
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium line-clamp-1">
                    {lang === "bn" ? s.name_bn ?? s.name_en : s.name_en}
                  </span>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}