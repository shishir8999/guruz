import { useEffect, useState } from "react";
import { useI18nStore } from "@/lib/i18n";

export interface HeroSlide {
  id: string | number;
  image_url?: string | null;
  title_en?: string;
  title_bn?: string;
  subtitle_en?: string;
  subtitle_bn?: string;
  cta_label_en?: string;
  cta_label_bn?: string;
  cta_url?: string;
  bg_color?: string;
  text_color?: string;
}

type Props = { brandName?: string; hidden?: boolean };

/** Auto-rotating slim banner shown at the very top of the desktop header. */
export function HeaderPromoSlider({ brandName, hidden = false }: Props) {
  const { lang } = useI18nStore();
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  const [idx, setIdx] = useState(0);
  const total = slides.length;

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 4500);
    return () => clearInterval(t);
  }, [total]);

  // No admin slides uploaded yet — render nothing (no demo content).
  if (total === 0) return null;
  void brandName;

  return (
    <div
      className={`relative w-full overflow-hidden bg-white transition-[height,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        hidden ? "h-0 opacity-0" : "h-[48px] md:h-[72px] opacity-100"
      }`}
    >
      {slides.map((s, i) => {
        const active = i === idx;
        const hasImage = !!s.image_url;
        const title = lang === "bn" && s.title_bn ? s.title_bn : s.title_en;
        const subtitle = lang === "bn" && s.subtitle_bn ? s.subtitle_bn : s.subtitle_en;
        const cta = lang === "bn" && s.cta_label_bn ? s.cta_label_bn : s.cta_label_en;
        const bg = s.bg_color || "#0a4bd6";
        const fg = s.text_color || "#ffffff";
        return (
          <a
            key={s.id}
            href={s.cta_url || "#"}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            style={hasImage ? undefined : { backgroundColor: bg, color: fg }}
          >
            {hasImage && (
              <img
                src={s.image_url ?? undefined}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
            {!hasImage && (
              <div className="relative mx-auto max-w-7xl h-full px-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-lg md:text-xl font-black tracking-wide truncate drop-shadow-sm">{title}</div>
                  {subtitle && (
                    <div className="text-xs md:text-sm font-medium opacity-90 truncate">{subtitle}</div>
                  )}
                </div>
                {cta && (
                  <span className="shrink-0 bg-[color:var(--brand-orange,#f97316)] text-white font-black text-xs md:text-sm px-3 py-1.5 rounded shadow">
                    {cta}
                  </span>
                )}
              </div>
            )}
          </a>
        );
      })}

      {total > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-yellow-300" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}