import { useEffect, useRef, useState } from "react";
import { X, Package, Scissors, ArrowUp, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type Stage = "sealed" | "unsealed" | "opened" | "revealed";

interface Props {
  images: string[];
  productName: string;
  onClose: () => void;
}

const T = {
  bn: {
    title: "ভার্চুয়াল আনবক্সিং",
    sealed: "সীল ভাঙতে ডানে সোয়াইপ করুন",
    unsealed: "ঢাকনা খুলতে উপরে সোয়াইপ করুন",
    opened: "ভেতরের আইটেম দেখতে ট্যাপ করুন",
    revealed: "আপনার প্যাকেজে যা থাকছে",
    reset: "আবার শুরু",
    close: "বন্ধ করুন",
    item: "আইটেম",
    accessory: "এক্সেসরিজ",
    guide: "ব্যবহার গাইড",
  },
  en: {
    title: "Virtual Unboxing",
    sealed: "Swipe right to break the seal",
    unsealed: "Swipe up to open the lid",
    opened: "Tap to reveal items inside",
    revealed: "What's in the box",
    reset: "Start again",
    close: "Close",
    item: "Item",
    accessory: "Accessory",
    guide: "User guide",
  },
  hi: {
    title: "वर्चुअल अनबॉक्सिंग",
    sealed: "सील तोड़ने के लिए दाएं स्वाइप करें",
    unsealed: "ढक्कन खोलने के लिए ऊपर स्वाइप करें",
    opened: "अंदर की चीज़ें देखने के लिए टैप करें",
    revealed: "बॉक्स में क्या है",
    reset: "फिर से शुरू",
    close: "बंद करें",
    item: "आइटम",
    accessory: "एक्सेसरी",
    guide: "उपयोग गाइड",
  },
};

export function VirtualUnboxing({ images, productName, onClose }: Props) {
  const { lang } = useI18n();
  const t = T[lang as keyof typeof T] ?? T.en;
  const [stage, setStage] = useState<Stage>("sealed");
  const [sealProgress, setSealProgress] = useState(0); // 0..1
  const [lidProgress, setLidProgress] = useState(0); // 0..1 (degrees / 110)
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const mainImg = images[0] ?? "";
  const accessories = images.slice(1, 5);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const onPointerDown = (e: React.PointerEvent) => {
    startRef.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (stage === "sealed") {
      const p = Math.max(0, Math.min(1, dx / 220));
      setSealProgress(p);
      if (p >= 1) {
        setStage("unsealed");
        startRef.current = null;
      }
    } else if (stage === "unsealed") {
      const p = Math.max(0, Math.min(1, -dy / 180));
      setLidProgress(p);
      if (p >= 1) {
        setStage("opened");
        startRef.current = null;
      }
    }
  };
  const onPointerUp = () => {
    startRef.current = null;
  };

  const reset = () => {
    setStage("sealed");
    setSealProgress(0);
    setLidProgress(0);
  };

  const instr =
    stage === "sealed" ? t.sealed :
    stage === "unsealed" ? t.unsealed :
    stage === "opened" ? t.opened : t.revealed;

  return (
    <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-amber-300" />
          <div>
            <div className="text-sm font-semibold">{t.title}</div>
            <div className="text-[11px] text-white/60 line-clamp-1 max-w-[60vw]">{productName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="text-xs rounded-full px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white"
          >
            {t.reset}
          </button>
          <button
            onClick={onClose}
            aria-label={t.close}
            className="rounded-full p-2 bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* stage area */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{ perspective: "1200px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => stage === "opened" && setStage("revealed")}
      >
        {/* floor glow */}
        <div className="absolute left-1/2 top-[62%] -translate-x-1/2 w-72 h-6 rounded-[50%] bg-amber-300/20 blur-2xl" />

        {/* Box */}
        {stage !== "revealed" && (
          <div
            ref={boxRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
            style={{
              width: 260,
              height: 200,
              transformStyle: "preserve-3d",
              transform: `rotateX(-18deg) rotateY(-24deg)`,
              transition: "transform 400ms ease",
            }}
          >
            {/* Bottom (base) */}
            <BoxFace pos="front" color="#8B5A2B" depth={120} />
            <BoxFace pos="back" color="#5C3A1E" depth={120} />
            <BoxFace pos="left" color="#6B4423" depth={120} />
            <BoxFace pos="right" color="#A0693A" depth={120} />
            <BoxFace pos="bottom" color="#4A2E17" depth={120} />

            {/* Inner glow / product peek */}
            {(stage === "unsealed" || stage === "opened") && mainImg && (
              <div
                className="absolute inset-x-2 top-2 bottom-2 rounded-md overflow-hidden bg-gradient-to-b from-amber-50 to-white flex items-center justify-center"
                style={{
                  transform: "translateZ(2px)",
                  opacity: 0.15 + lidProgress * 0.85,
                }}
              >
                <img
                  src={mainImg}
                  alt=""
                  className="max-w-[80%] max-h-[80%] object-contain"
                  style={{
                    transform: `translateY(${(1 - lidProgress) * 40}px) scale(${0.6 + lidProgress * 0.4})`,
                    transition: "transform 200ms ease",
                  }}
                />
              </div>
            )}

            {/* Lid */}
            <div
              className="absolute inset-0"
              style={{
                transformOrigin: "top center",
                transform: `translateZ(120px) rotateX(${-lidProgress * 110}deg)`,
                transition: stage === "opened" ? "transform 400ms ease" : "none",
              }}
            >
              <div
                className="absolute inset-0 rounded-sm shadow-2xl flex items-center justify-center text-white"
                style={{
                  background:
                    "linear-gradient(135deg,#C9863F 0%, #A0693A 45%, #8B5A2B 100%)",
                  border: "2px solid rgba(0,0,0,0.15)",
                }}
              >
                <div className="text-center pointer-events-none">
                  <Package className="h-6 w-6 mx-auto text-amber-100/90" />
                  <div className="mt-1 text-xs tracking-widest font-bold">GURUZ</div>
                  <div className="text-[9px] text-amber-100/80 mt-0.5">PREMIUM</div>
                </div>

                {/* Seal / tape */}
                {stage === "sealed" && (
                  <div
                    className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-6 bg-[color:var(--brand-red,#e53935)] shadow-inner flex items-center justify-center overflow-hidden"
                    style={{
                      clipPath: `polygon(0 0, ${100 - sealProgress * 100}% 0, ${100 - sealProgress * 100}% 100%, 0 100%)`,
                    }}
                  >
                    <div className="text-[10px] font-bold tracking-widest text-white/95 flex items-center gap-1">
                      <Scissors className="h-3 w-3" /> SEALED · SEALED · SEALED
                    </div>
                  </div>
                )}
                {stage === "sealed" && sealProgress > 0 && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-6 border-l-2 border-dashed border-white/70"
                    style={{ left: `${(1 - sealProgress) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Revealed items */}
        {stage === "revealed" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4 animate-fade-in">
            <div className="text-white/90 text-sm font-semibold">{t.revealed}</div>
            <div className="relative w-full max-w-md">
              {/* main product */}
              <div className="mx-auto w-48 h-48 rounded-2xl bg-white shadow-2xl flex items-center justify-center overflow-hidden animate-scale-in">
                {mainImg && <img src={mainImg} alt={productName} className="max-w-[85%] max-h-[85%] object-contain" />}
              </div>
              <div className="mt-2 text-center text-white text-xs">{t.item}</div>
            </div>
            {accessories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                {accessories.map((src, i) => (
                  <div
                    key={src + i}
                    className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
                  >
                    <img src={src} alt="" className="max-w-[80%] max-h-[80%] object-contain" />
                  </div>
                ))}
              </div>
            )}
            <div className="text-[11px] text-white/60 flex items-center gap-1">
              <Check className="h-3 w-3" /> {t.guide} · {t.accessory}
            </div>
          </div>
        )}

        {/* instruction bar */}
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 pointer-events-none">
          {stage === "sealed" && (
            <div className="w-56 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-[color:var(--brand-red,#e53935)] transition-[width] duration-100"
                style={{ width: `${sealProgress * 100}%` }}
              />
            </div>
          )}
          {stage === "unsealed" && (
            <div className="w-56 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-[width] duration-100"
                style={{ width: `${lidProgress * 100}%` }}
              />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-2 text-white text-xs">
            {stage === "unsealed" && <ArrowUp className="h-3.5 w-3.5 animate-bounce" />}
            {instr}
          </div>
        </div>
      </div>
    </div>
  );
}

function BoxFace({
  pos,
  color,
  depth,
}: {
  pos: "front" | "back" | "left" | "right" | "bottom";
  color: string;
  depth: number;
}) {
  const style: React.CSSProperties = {
    position: "absolute",
    background: color,
    boxShadow: "inset 0 0 40px rgba(0,0,0,0.25)",
  };
  if (pos === "front") {
    Object.assign(style, {
      inset: 0,
      transform: `translateZ(0px) rotateX(90deg) translateY(${depth}px)`,
      transformOrigin: "top center",
      width: "100%",
      height: depth,
    });
  } else if (pos === "back") {
    Object.assign(style, {
      top: 0,
      left: 0,
      width: "100%",
      height: depth,
      transform: `translateZ(0) rotateX(-90deg)`,
      transformOrigin: "top center",
    });
  } else if (pos === "left") {
    Object.assign(style, {
      top: 0,
      left: 0,
      width: depth,
      height: "100%",
      transform: `rotateY(-90deg) translateX(0)`,
      transformOrigin: "left center",
    });
  } else if (pos === "right") {
    Object.assign(style, {
      top: 0,
      right: 0,
      width: depth,
      height: "100%",
      transform: `rotateY(90deg)`,
      transformOrigin: "right center",
    });
  } else {
    Object.assign(style, {
      inset: 0,
      transform: `translateZ(0)`,
    });
  }
  return <div style={style} />;
}