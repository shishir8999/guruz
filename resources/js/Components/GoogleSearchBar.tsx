import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Mic, Camera, X, Loader2 } from "lucide-react";
import { useSiteSettings } from "@/lib/use-site-settings";
import { useI18n } from "@/lib/i18n";
import { cdnImage } from "@/lib/img";

type SR = {
  new (): {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
    onerror: ((e: unknown) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
  };
};

export function GoogleSearchBar() {
  const nav = useNavigate();
  const settings = useSiteSettings();
  const { lang } = useI18n();
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<InstanceType<SR> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const placeholder =
    lang === "bn" ? "সার্চ করুন প্রোডাক্ট, ব্র্যান্ড, ক্যাটাগরি..."
    : lang === "hi" ? "उत्पाद, ब्रांड खोजें..."
    : "Search products, brands, categories...";

  const submit = (text: string) => {
    const query = text.trim();
    if (!query) return;
    nav({ to: "/products", search: { q: query, cat: "" } });
  };

  const startVoice = () => {
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      alert(lang === "bn" ? "ভয়েস সার্চ এই ব্রাউজারে সাপোর্টেড না।" : "Voice search is not supported in this browser.");
      return;
    }
    const rec = new Ctor();
    rec.lang = lang === "bn" ? "bn-BD" : lang === "hi" ? "hi-IN" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let txt = "";
      for (let i = 0; i < e.results.length; i++) {
        txt += e.results[i][0].transcript;
      }
      setInterim(txt);
      finalText = txt;
    };
    rec.onerror = () => { setListening(false); };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      if (finalText) {
        setQ(finalText);
        submit(finalText);
      }
    };
    recRef.current = rec;
    setListening(true);
    setInterim("");
    try { rec.start(); } catch { setListening(false); }
  };

  const stopVoice = () => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  };

  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* noop */ } }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(q); }}
        className="group relative"
      >
        <div
          className="flex items-center gap-2 h-9 sm:h-11 px-2.5 sm:px-4 rounded-full shadow-[0_1px_6px_rgba(32,33,36,0.28)] hover:shadow-[0_2px_10px_rgba(32,33,36,0.35)] focus-within:shadow-[0_2px_14px_rgba(32,33,36,0.4)] border border-transparent focus-within:border-blue-400 transition-all"
          style={{
            backgroundColor: `var(--search-bar-bg, ${settings.theme_colors?.search_bar_bg ?? "#ffffff"})`,
            color: `var(--search-bar-fg, ${settings.theme_colors?.search_bar_fg ?? "#1f2937"})`,
          }}
        >
          {/* Site logo (Google's G spot) */}
          <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black ring-1 ring-white/20 shadow-[0_2px_6px_rgba(0,0,0,0.35)] flex items-center justify-center overflow-hidden p-[3px]">
            {settings.logo_url ? (
              <img
                src={cdnImage(settings.logo_url, { width: 64, quality: 80 }) || settings.logo_url}
                alt={settings.brand_name || "Logo"}
                width={32}
                height={32}
                decoding="async"
                loading="lazy"
                className="w-full h-full object-contain"
                style={{ filter: "drop-shadow(0 0 1px rgba(255,255,255,0.6)) contrast(1.1)" }}
              />
            ) : (
              <span className="font-black text-lg bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC05] bg-clip-text text-transparent">
                {(settings.brand_name || "G").slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>

          <input
            type="text"
            value={listening ? (interim || q) : q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={listening ? (lang === "bn" ? "শুনছি..." : "Listening...") : placeholder}
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] sm:text-base placeholder:opacity-60"
            style={{ color: "inherit" }}
            autoComplete="off"
          />

          {q && !listening && (
            <button type="button" onClick={() => setQ("")} className="p-1 rounded-full hover:bg-gray-100 text-gray-500" aria-label="Clear">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <div className="w-px h-6 bg-gray-200 mx-0.5 hidden sm:block" />

          {/* Voice */}
          <button
            type="button"
            onClick={listening ? stopVoice : startVoice}
            className={`shrink-0 p-1.5 sm:p-2 rounded-full transition-colors ${
              listening ? "bg-red-500 text-white animate-pulse" : "hover:bg-blue-50"
            }`}
            aria-label="Voice search"
          >
            {listening
              ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              : (
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path fill="#4285F4" d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
                  <path fill="#34A853" d="M19 12a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.08A7 7 0 0 0 19 12Z" />
                </svg>
              )}
          </button>

          {/* Camera / image search fallback opens file picker; navigates to /products with q from filename */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-blue-50"
            aria-label="Image search"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[#4285F4]" strokeWidth={2} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const guess = f.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").slice(0, 40);
              submit(guess);
            }}
          />

          <button
            type="submit"
            className="shrink-0 hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white"
            aria-label="Search"
          >
            <Search className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {listening && (
          <div className="absolute inset-x-0 -bottom-8 text-center text-xs text-gray-600">
            🎙️ {lang === "bn" ? "কথা বলুন..." : "Speak now..."}
          </div>
        )}
      </form>
    </div>
  );
}