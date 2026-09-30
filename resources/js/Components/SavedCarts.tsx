import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart, type CartItem } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Bookmark, RotateCcw, Trash2, Plus, Loader2, LogIn } from "lucide-react";
import { Link } from "@tanstack/react-router";

type SavedCart = {
  id: string;
  name: string | null;
  items: CartItem[];
  created_at: string;
};

export function SavedCarts() {
  const { user } = useAuth();
  const { lang } = useI18n();
  const items = useCart((s) => s.items);
  const replace = useCart((s) => s.replace);
  const merge = useCart((s) => s.merge);
  const clear = useCart((s) => s.clear);

  const [saved, setSaved] = useState<SavedCart[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  const t = (bn: string, en: string, hi: string) => (lang === "bn" ? bn : lang === "hi" ? hi : en);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_carts")
      .select("id,name,items,created_at")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { toast.error(t("সেভড কার্ট লোড হয়নি", "Failed to load saved carts", "सहेजे गए कार्ट लोड नहीं हुए")); return; }
    setSaved((data ?? []) as SavedCart[]);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const saveCart = async () => {
    if (!user) { toast.error(t("সেভ করতে লগইন করুন", "Sign in to save", "सहेजने के लिए साइन इन करें")); return; }
    if (items.length === 0) { toast.error(t("কার্ট খালি", "Cart is empty", "कार्ट खाली है")); return; }
    setSaving(true);
    const { error } = await supabase.from("saved_carts").insert({
      user_id: user.id,
      name: name.trim() || null,
      items: items as never,
    });
    setSaving(false);
    if (error) { toast.error(t("সেভ ব্যর্থ", "Save failed", "सेव विफल")); return; }
    setName("");
    toast.success(t("কার্ট সেভ হয়েছে", "Cart saved", "कार्ट सहेजा गया"));
    void load();
  };

  const restore = (sc: SavedCart, mode: "replace" | "merge") => {
    const list = Array.isArray(sc.items) ? sc.items : [];
    if (list.length === 0) { toast.error(t("সেভড কার্ট খালি", "Saved cart is empty", "सहेजा कार्ट खाली")); return; }
    if (mode === "replace") replace(list); else merge(list);
    toast.success(t("কার্ট রিস্টোর হয়েছে", "Cart restored", "कार्ट पुनर्स्थापित"));
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("saved_carts").delete().eq("id", id);
    if (error) { toast.error(t("ডিলিট ব্যর্থ", "Delete failed", "डिलीट विफल")); return; }
    setSaved((prev) => prev.filter((s) => s.id !== id));
    toast.success(t("মুছে ফেলা হয়েছে", "Deleted", "हटाया गया"));
  };

  if (!user) {
    return (
      <div className="bg-white rounded-xl p-4 border border-dashed">
        <div className="flex items-start gap-2">
          <Bookmark className="w-4 h-4 mt-0.5 text-primary" />
          <div className="text-sm">
            <div className="font-semibold mb-1">{t("পরে কিনুন", "Save for later", "बाद के लिए सहेजें")}</div>
            <p className="text-muted-foreground text-xs mb-2">
              {t("কার্ট সেভ করে রাখতে লগইন করুন — যেকোনো ডিভাইস থেকে এক ক্লিকে ফিরিয়ে আনুন।", "Sign in to save this cart and restore it later from any device.", "साइन इन कर कार्ट सहेजें — किसी भी डिवाइस से एक क्लिक में पाएं।")}
            </p>
            <Link to="/login" className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
              <LogIn className="w-3.5 h-3.5" /> {t("লগইন", "Sign in", "साइन इन")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Bookmark className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">{t("সেভড কার্ট", "Saved carts", "सहेजे कार्ट")}</h3>
      </div>

      {items.length > 0 && (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("নাম (ঐচ্ছিক)", "Name (optional)", "नाम (वैकल्पिक)")}
            className="flex-1 border rounded-md px-2 py-1.5 text-sm"
            maxLength={60}
          />
          <button
            onClick={saveCart}
            disabled={saving}
            className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-[color:var(--primary-dark)] disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {t("সেভ করুন", "Save cart", "सहेजें")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> {t("লোড হচ্ছে…", "Loading…", "लोड हो रहा…")}</div>
      ) : saved.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("এখনো কোনো সেভড কার্ট নেই।", "No saved carts yet.", "अभी कोई सहेजा कार्ट नहीं।")}
        </p>
      ) : (
        <ul className="divide-y">
          {saved.map((sc) => {
            const count = Array.isArray(sc.items) ? sc.items.reduce((s, i) => s + (i?.quantity ?? 0), 0) : 0;
            return (
              <li key={sc.id} className="py-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {sc.name || t("অজানা কার্ট", "Untitled cart", "बिना नाम")}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {count} {t("আইটেম", "items", "आइटम")} • {new Date(sc.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => restore(sc, "merge")}
                    title={t("কার্টে যোগ করুন", "Add to current cart", "कार्ट में जोड़ें")}
                    className="text-xs px-2 py-1 rounded border hover:bg-secondary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => restore(sc, "replace")}
                    title={t("রিস্টোর (রিপ্লেস)", "Restore (replace)", "पुनर्स्थापित (रिप्लेस)")}
                    className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 font-semibold inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t("রিস্টোর", "Restore", "पुनर्स्थापित")}
                  </button>
                  <button
                    onClick={() => del(sc.id)}
                    title={t("মুছুন", "Delete", "हटाएं")}
                    className="text-xs px-2 py-1 rounded text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}