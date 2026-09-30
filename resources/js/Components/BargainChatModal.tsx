import { useEffect, useRef, useState } from "react";
import { X, Send, Tag, CheckCircle2, ShoppingCart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { bargainNegotiate } from "@/lib/bargain.functions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

interface Props {
  productId: string;
  productName: string;
  listPrice: number;
  shopId?: string | null;
  onClose: () => void;
  onAccept: (finalPrice: number) => void;
}

const T = {
  bn: {
    title: "দামাদামি করুন",
    subtitle: "আপনার অফার দিন — AI বট সাথে দর কষবে",
    listed: "তালিকা মূল্য",
    yourOffer: "আপনার অফার (৳)",
    send: "পাঠান",
    thinking: "ভাবছে...",
    accept: "রফা মূল্যে কার্টে যোগ করুন",
    intro: "আসসালামু আলাইকুম! এই পণ্যটির জন্য আপনি কত দিতে চান বলুন — দেখি কী করা যায়!",
    min: "সর্বনিম্ন",
    lower: "আপনার অফার তালিকা মূল্যের চেয়ে কম হতে হবে",
    dealPrice: "রফা মূল্য",
  },
  en: {
    title: "Make an Offer",
    subtitle: "Name your price — our AI bot will haggle",
    listed: "Listed",
    yourOffer: "Your offer (৳)",
    send: "Send",
    thinking: "Thinking...",
    accept: "Add to cart at deal price",
    intro: "Hi! What price are you willing to pay for this? Let's see what we can do!",
    min: "Min",
    lower: "Your offer must be lower than the listed price",
    dealPrice: "Deal price",
  },
  hi: {
    title: "मोलभाव करें",
    subtitle: "अपनी कीमत बताएं — AI बॉट मोलभाव करेगा",
    listed: "सूची मूल्य",
    yourOffer: "आपकी पेशकश (৳)",
    send: "भेजें",
    thinking: "सोच रहा है...",
    accept: "इस कीमत पर कार्ट में जोड़ें",
    intro: "नमस्ते! इस उत्पाद के लिए आप कितनी कीमत देना चाहेंगे?",
    min: "न्यूनतम",
    lower: "आपकी पेशकश सूची मूल्य से कम होनी चाहिए",
    dealPrice: "तय कीमत",
  },
};

export function BargainChatModal({ productId, productName, listPrice, shopId, onClose, onAccept }: Props) {
  const { lang } = useI18n();
  const t = T[lang as keyof typeof T] ?? T.en;
  const negotiate = useServerFn(bargainNegotiate);

  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: t.intro },
  ]);
  const [offer, setOffer] = useState<string>(String(Math.round(listPrice * 0.8)));
  const [busy, setBusy] = useState(false);
  const [dealPrice, setDealPrice] = useState<number | null>(null);
  const [offerRowId, setOfferRowId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const num = Number(offer);
    if (!Number.isFinite(num) || num <= 0) return;
    if (num >= listPrice) {
      // Auto-clamp to a valid offer just below the listed price instead of blocking the user
      const clamped = Math.max(1, Math.floor(listPrice - 1));
      setOffer(String(clamped));
      toast.error(t.lower);
      return;
    }
    const userMsg: Msg = {
      role: "user",
      content: `${lang === "bn" ? "আমি দিতে পারবো" : lang === "hi" ? "मैं दूंगा" : "I'll offer"} ${num}৳`,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setBusy(true);
    try {
      const res = await negotiate({
        data: {
          productId,
          productName,
          listPrice,
          offer: num,
          history: messages.slice(-10), // send prior turns
          lang: (lang as "bn" | "en" | "hi") ?? "bn",
        },
      });
      setMessages([...nextHistory, { role: "assistant", content: res.message }]);
      if (res.accepted && res.final_price) {
        setDealPrice(res.final_price);
      } else {
        // Pre-fill offer input with the counter to make the next round easy
        setOffer(String(res.counter_price));
      }
      // Persist the offer in the database so admin & shop owner can see it
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (uid) {
          const finalMsgs = [...nextHistory, { role: "assistant" as const, content: res.message }];
          const payload = {
            user_id: uid,
            product_id: productId,
            shop_id: shopId ?? null,
            product_name: productName,
            list_price: listPrice,
            offer_price: num,
            counter_price: res.counter_price ?? null,
            final_price: res.accepted ? res.final_price : null,
            accepted: !!res.accepted,
            status: res.accepted ? "accepted" : "negotiating",
            messages: finalMsgs,
          };
          if (offerRowId) {
            await supabase.from("bargain_offers").update(payload).eq("id", offerRowId);
          } else {
            const { data: inserted } = await supabase
              .from("bargain_offers")
              .insert(payload)
              .select("id")
              .maybeSingle();
            if (inserted?.id) setOfferRowId(inserted.id);
          }
        }
      } catch {
        // non-fatal — logging failure should not break UX
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">{t.title}</div>
              <div className="text-[11px] opacity-90 line-clamp-1 max-w-[60vw]">{productName}</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="close" className="rounded-full p-1.5 hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Price bar */}
        <div className="px-4 py-2 bg-amber-50 border-b flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t.listed}: <span className="font-semibold text-foreground line-through">৳{listPrice}</span></span>
          <span className="text-[11px] text-amber-700">{t.subtitle}</span>
        </div>

        {/* Messages */}
        <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-foreground rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm text-muted-foreground animate-pulse">
                {t.thinking}
              </div>
            </div>
          )}
        </div>

        {/* Deal / composer */}
        {dealPrice ? (
          <div className="p-4 border-t bg-green-50 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">{t.dealPrice}: ৳{dealPrice}</span>
              <span className="ml-auto text-xs text-green-700/80 line-through">৳{listPrice}</span>
            </div>
            <button
              onClick={() => {
                onAccept(dealPrice);
                onClose();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              {t.accept}
            </button>
          </div>
        ) : (
          <div className="p-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center border-2 border-amber-300 rounded-lg overflow-hidden focus-within:border-amber-500">
                <span className="px-3 text-muted-foreground text-sm">৳</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={Math.max(1, listPrice - 1)}
                  value={offer}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") { setOffer(""); return; }
                    const n = Number(v);
                    if (!Number.isFinite(n)) return;
                    const cap = Math.max(1, Math.floor(listPrice - 1));
                    setOffer(String(Math.min(n, cap)));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !busy && send()}
                  placeholder={t.yourOffer}
                  className="flex-1 py-2 text-sm outline-none bg-transparent"
                  disabled={busy}
                />
              </div>
              <button
                onClick={send}
                disabled={busy || !offer}
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {t.send}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}