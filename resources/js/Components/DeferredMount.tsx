import { useEffect, useState, type ReactNode } from "react";

/**
 * Mounts children only after the browser is idle (or after `delay` ms fallback).
 * Used to keep non-critical UI (seasonal effects, popups) off the LCP/TBT path.
 */
export function DeferredMount({
  children,
  delay = 3000,
  minHeight,
  requireInteraction = false,
}: {
  children: ReactNode;
  delay?: number;
  /** Reserve vertical space while not mounted to prevent CLS. */
  minHeight?: number | string;
  /** Also require a user interaction (pointer/scroll/key) before mounting. */
  requireInteraction?: boolean;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    let interacted = !requireInteraction;
    let idled = false;
    const done = () => {
      if (!cancelled && interacted && idled) setReady(true);
    };
    const markIdle = () => { idled = true; done(); };
    const markInteracted = () => { interacted = true; done(); };
    const w = window as any;
    let idleId: number | undefined;
    const timerId = window.setTimeout(markIdle, delay);
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(markIdle, { timeout: delay });
    }
    const events = ["pointerdown", "touchstart", "keydown", "scroll", "wheel"] as const;
    if (requireInteraction) {
      events.forEach((e) => window.addEventListener(e, markInteracted, { once: true, passive: true }));
    }
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
      if (idleId && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleId);
      if (requireInteraction) events.forEach((e) => window.removeEventListener(e, markInteracted));
    };
  }, [delay, requireInteraction]);
  if (!ready) {
    return minHeight ? (
      <div style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }} aria-hidden />
    ) : null;
  }
  return <>{children}</>;
}