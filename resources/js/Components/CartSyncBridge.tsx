import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * Mirrors the signed-in user's local cart to `active_carts` on the server so
 * the daily follow-up job can spot carts that sat idle for 5+ days.
 * Runs client-side only; no-op for guests.
 */
export function CartSyncBridge() {
  const { user } = useAuth();
  const items = useCart((s) => s.items);
  const subtotalFn = useCart((s) => s.subtotal);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPayload = useRef<string>("");

  useEffect(() => {
    if (!user?.id) return;
    const payload = JSON.stringify(items);
    if (payload === lastPayload.current) return;
    lastPayload.current = payload;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const subtotal = subtotalFn();
        await (supabase.from as any)("active_carts").upsert(
          {
            user_id: user.id,
            cart_items: items,
            subtotal,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      } catch {
        // best-effort — network/RLS errors are non-fatal
      }
    }, 1500);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user?.id, items, subtotalFn]);

  return null;
}