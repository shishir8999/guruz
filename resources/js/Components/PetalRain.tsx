import { useMemo } from "react";

const PETALS = ["🌸", "🌺", "🌷", "💐", "🌹", "🏵️", "🌼"];

export function PetalRain({ active, count = 60 }: { active: boolean; count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 5,
        size: 16 + Math.random() * 22,
        sway: 20 + Math.random() * 60,
        rotate: Math.random() * 360,
        emoji: PETALS[Math.floor(Math.random() * PETALS.length)],
      })),
    [count],
  );
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[190] overflow-hidden">
      {items.map((p) => (
        <span
          key={p.id}
          className="absolute -top-10 select-none will-change-transform"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite, petal-sway ${p.duration / 2}s ease-in-out ${p.delay}s infinite alternate`,
            // @ts-expect-error custom prop
            "--sway": `${p.sway}px`,
            "--rot": `${p.rotate}deg`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}