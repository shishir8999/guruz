import { Link } from "@tanstack/react-router";
import { Star, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

export function HighlightProducts({ products }: { products: Product[] }) {
  const { lang } = useI18n();
  const items = products.filter((p) => p.is_featured).slice(0, 20);
  if (items.length === 0) return null;
  return (
    <section className="rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 p-1.5 sm:p-2">
      <div className="flex items-center justify-between text-white mb-1.5">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
          <h2 className="font-bold text-xs sm:text-sm">
            {lang === "bn" ? "হাইলাইট প্রোডাক্ট" : "Highlight Products"}
          </h2>
        </div>
        <Link
          to="/products"
          className="text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
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