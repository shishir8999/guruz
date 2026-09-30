import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchActiveSeasonalTheme, type SeasonalTheme } from "@/lib/seasonal-themes";

/**
 * Site-wide seasonal effect overlay. Fetches the currently active theme and
 * renders a CSS-only particle layer (rain, snow, fireworks, petals, stars, confetti).
 * Fixed, pointer-events-none, non-blocking.
 */
export function SeasonalEffects({ override }: { override?: SeasonalTheme | null } = {}) {
  const { data: fetched } = useQuery({
    queryKey: ["active_seasonal_theme"],
    queryFn: fetchActiveSeasonalTheme,
    staleTime: 60_000,
    enabled: override === undefined,
  });
  const theme = override !== undefined ? override : fetched;

  // Cap particle count to keep off the compositor/main-thread hot path.
  // Previous max ~100 created 249+ animated nodes site-wide (per Lighthouse).
  const intensity = Math.max(10, Math.min(100, theme?.intensity ?? 50));
  const count = Math.round((intensity / 100) * 28) + 6;
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  if (!theme || !theme.effects_enabled) return null;

  const effect = theme.effect_type;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {effect === "rain" &&
        particles.map((i) => (
          <span
            key={i}
            className="absolute block w-[2px] rounded-full bg-gradient-to-b from-sky-300/70 to-sky-500/10 animate-rain-fall"
            style={{
              left: `${(i * 17) % 100}%`,
              height: `${14 + (i % 6) * 3}px`,
              animationDelay: `${(i * 0.13) % 2}s`,
              animationDuration: `${0.6 + (i % 5) * 0.15}s`,
              top: `-${20 + (i % 8) * 6}px`,
            }}
          />
        ))}

      {effect === "snow" &&
        particles.map((i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-white/90 animate-snow-fall shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            style={{
              left: `${(i * 23) % 100}%`,
              width: `${4 + (i % 5)}px`,
              height: `${4 + (i % 5)}px`,
              animationDelay: `${(i * 0.2) % 4}s`,
              animationDuration: `${5 + (i % 6)}s`,
              top: `-${10 + (i % 6) * 5}px`,
            }}
          />
        ))}

      {effect === "petals" &&
        particles.slice(0, 30).map((i) => (
          <span
            key={i}
            className="absolute block rounded-full animate-petal-fall"
            style={{
              left: `${(i * 31) % 100}%`,
              width: `${8 + (i % 4) * 2}px`,
              height: `${5 + (i % 4)}px`,
              background: i % 3 === 0 ? "#fb923c" : i % 3 === 1 ? "#f472b6" : "#fbbf24",
              boxShadow: "0 0 6px rgba(251,146,60,0.6)",
              animationDelay: `${(i * 0.3) % 6}s`,
              animationDuration: `${7 + (i % 5)}s`,
              top: `-${10 + (i % 6) * 5}px`,
              transform: `rotate(${(i * 37) % 360}deg)`,
            }}
          />
        ))}

      {effect === "stars" &&
        particles.map((i) => (
          <span
            key={i}
            className="absolute block animate-star-twinkle"
            style={{
              left: `${(i * 19) % 100}%`,
              top: `${(i * 41) % 100}%`,
              width: "3px",
              height: "3px",
              borderRadius: "9999px",
              background: "#fef3c7",
              boxShadow: "0 0 8px #fde68a, 0 0 14px #fbbf24",
              animationDelay: `${(i * 0.11) % 3}s`,
              animationDuration: `${1.6 + (i % 4) * 0.4}s`,
            }}
          />
        ))}

      {effect === "confetti" &&
        particles.map((i) => {
          const palette = ["#006a4e", "#f42a41", "#ffffff", "#fbbf24", "#22c55e"];
          return (
            <span
              key={i}
              className="absolute block animate-confetti-fall"
              style={{
                left: `${(i * 13) % 100}%`,
                width: `${6 + (i % 3) * 2}px`,
                height: `${10 + (i % 4) * 2}px`,
                background: palette[i % palette.length],
                animationDelay: `${(i * 0.15) % 3}s`,
                animationDuration: `${4 + (i % 5)}s`,
                top: `-${20 + (i % 6) * 6}px`,
                transform: `rotate(${(i * 47) % 360}deg)`,
              }}
            />
          );
        })}

      {effect === "fireworks" && (
        <>
          {[0, 1, 2, 3, 4].map((f) => (
            <div
              key={f}
              className="absolute animate-firework-burst"
              style={{
                left: `${15 + f * 18}%`,
                top: `${20 + (f % 3) * 15}%`,
                animationDelay: `${f * 0.9}s`,
              }}
            >
              {Array.from({ length: 14 }).map((_, s) => {
                const angle = (s / 14) * 2 * Math.PI;
                const color = ["#fde047", "#f472b6", "#38bdf8", "#a78bfa", "#f87171"][f % 5];
                return (
                  <span
                    key={s}
                    className="absolute block w-[3px] h-[3px] rounded-full animate-firework-spark"
                    style={{
                      background: color,
                      boxShadow: `0 0 6px ${color}, 0 0 12px ${color}`,
                      // custom props consumed by keyframes below
                      ["--tx" as any]: `${Math.cos(angle) * 70}px`,
                      ["--ty" as any]: `${Math.sin(angle) * 70}px`,
                      animationDelay: `${f * 0.9}s`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}