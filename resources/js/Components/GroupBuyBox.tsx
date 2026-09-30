import { useEffect, useState } from "react";
import { Users, Share2, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

type GroupBuy = {
  id: string;
  product_id: string;
  target_count: number;
  joined_count: number;
  unit_price: number;
  status: string;
  expires_at: string;
};

type Props = {
  productId: string;
  listPrice: number;
  groupPrice: number;
  minGroupSize: number;
  activeGroupId: string | null;
  onJoined: (unitPrice: number) => void;
};

export function GroupBuyBox({ productId, listPrice, groupPrice, minGroupSize, activeGroupId, onJoined }: Props) {
  const { lang } = useI18n();
  const [gb, setGb] = useState<GroupBuy | null>(null);
  const [busy, setBusy] = useState(false);
  const [justJoined, setJustJoined] = useState(false);

  const t = (bn: string, en: string, hi: string) => (lang === "bn" ? bn : lang === "hi" ? hi : en);
  const savings = Math.max(0, listPrice - groupPrice);
  const savingsPct = listPrice > 0 ? Math.round((savings / listPrice) * 100) : 0;

  // If user landed via share link, join automatically
  useEffect(() => {
    if (!activeGroupId) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      const { data, error } = await supabase.rpc("join_group_buy", { _id: activeGroupId });
      setBusy(false);
      if (cancelled) return;
      if (error) {
        toast.error(t("গ্রুপে যোগ দিতে সমস্যা", "Failed to join group", "समूह में शामिल नहीं हो सका"));
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row || row.product_id !== productId) {
        toast.error(t("গ্রুপ লিংক এই প্রোডাক্টের জন্য নয়", "This group link is for a different product", "यह लिंक इस उत्पाद के लिए नहीं है"));
        return;
      }
      setGb(row as GroupBuy);
      setJustJoined(true);
      onJoined(Number(row.unit_price));
      toast.success(
        row.status === "completed"
          ? t(`🎉 গ্রুপ সম্পূর্ণ! ৳${row.unit_price} প্রাইস লক`, `🎉 Group filled! ৳${row.unit_price} price locked`, `🎉 समूह पूरा! ৳${row.unit_price} पर लॉक`)
          : t(`গ্রুপে যোগ হয়েছে (${row.joined_count}/${row.target_count})`, `Joined group (${row.joined_count}/${row.target_count})`, `समूह में जुड़े (${row.joined_count}/${row.target_count})`),
      );
    })();
    return () => { cancelled = true; };
  }, [activeGroupId, productId]);

  const startGroupBuy = async () => {
    setBusy(true);
    const { data: userRes } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("group_buys")
      .insert({
        product_id: productId,
        initiator_user_id: userRes?.user?.id ?? null,
        target_count: minGroupSize,
        joined_count: 1,
        unit_price: groupPrice,
      })
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error(t("লিংক তৈরিতে সমস্যা", "Could not create link", "लिंक बनाने में समस्या"));
      return;
    }
    setGb(data as GroupBuy);
    const url = `${window.location.origin}/product/${productId}?gb=${data.id}`;
    const shareText = t(
      `আমার সাথে এই প্রোডাক্টটি কিনুন — মাত্র ৳${groupPrice} (নিয়মিত ৳${listPrice})! 🎁`,
      `Buy this with me for just ৳${groupPrice} (regular ৳${listPrice})! 🎁`,
      `मेरे साथ खरीदें केवल ৳${groupPrice} में (नियमित ৳${listPrice})! 🎁`,
    );
    if (navigator.share) {
      try { await navigator.share({ title: "Group Buy", text: shareText, url }); return; } catch { /* fallthrough */ }
    }
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      toast.success(t("লিংক কপি হয়েছে — বন্ধুকে পাঠান!", "Link copied — share with a friend!", "लिंक कॉपी हुआ — दोस्त को भेजें!"));
    } catch {
      toast.info(url);
    }
  };

  const filled = gb && gb.joined_count >= gb.target_count;

  return (
    <div className="mt-3 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50/60 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-700" />
          <span className="text-sm font-semibold text-emerald-900">
            {t("বন্ধুকে নিয়ে কিনুন", "Buy with a friend", "दोस्त के साथ खरीदें")}
          </span>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full">
          −{savingsPct}% • ৳{groupPrice}
        </span>
      </div>
      <p className="text-xs text-emerald-900/80 mb-2 leading-relaxed">
        {t(
          `${minGroupSize} জন একসাথে অর্ডার করলে প্রতি পিস ৳${groupPrice} (সাশ্রয় ৳${savings})।`,
          `Order together with ${minGroupSize - 1} friend and get each piece at ৳${groupPrice} (save ৳${savings}).`,
          `${minGroupSize} लोग एक साथ ऑर्डर करें और प्रति पीस ৳${groupPrice} पाएं (बचत ৳${savings})।`,
        )}
      </p>
      {gb ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-900">
              {t("অগ্রগতি", "Progress", "प्रगति")}: <b>{gb.joined_count}/{gb.target_count}</b>
            </span>
            {filled ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <Check className="h-3.5 w-3.5" /> {t("প্রাইস লক", "Price locked", "कीमत लॉक")}
              </span>
            ) : (
              <span className="text-emerald-800/70">
                {t("আরো লাগবে", "Need more", "और चाहिए")}: {gb.target_count - gb.joined_count}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(100, (gb.joined_count / gb.target_count) * 100)}%` }}
            />
          </div>
          {!filled && !justJoined && (
            <button
              onClick={startGroupBuy}
              disabled={busy}
              className="w-full text-xs font-semibold text-emerald-800 underline"
            >
              {t("আবার লিংক শেয়ার করুন", "Share link again", "फिर से लिंक शेयर करें")}
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={startGroupBuy}
          disabled={busy}
          className="w-full rounded-md py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
          {t("বন্ধুর সাথে শেয়ার করুন", "Share link with friend", "दोस्त के साथ शेयर करें")}
        </button>
      )}
    </div>
  );
}