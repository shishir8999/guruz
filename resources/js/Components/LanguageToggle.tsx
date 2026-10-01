import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

type Props = {
  variant?: "header" | "footer" | "floating";
  className?: string;
};

export function LanguageToggle({ variant = "header", className = "" }: Props) {
  const { lang, setLang } = useI18n();

  const base =
    "inline-flex items-center gap-1 rounded-full border overflow-hidden text-xs font-semibold select-none";
  const styles =
    variant === "floating"
      ? "border-black/10 bg-white text-gray-800 shadow-lg shadow-black/20"
      : variant === "header"
      ? "border-white/25 bg-white/10 text-white"
      : "border-white/25 bg-white/5 text-white";

  const inactiveText =
    variant === "floating" ? "text-gray-600 hover:bg-black/5" : "text-white/80 hover:bg-white/10";
  const pill = (active: boolean) =>
    active ? "bg-[color:var(--brand-orange)] text-white" : inactiveText;

  const iconClass = variant === "floating" ? "w-4 h-4 ml-2 opacity-70" : "w-3 h-3 ml-1.5 opacity-80";
  const isHeader = variant === "header";
  // Short labels in the header keep the toggle inside the viewport on mobile.
  const labels = isHeader
    ? { bn: "BN", en: "EN", hi: "HI" }
    : { bn: "বাংলা", en: "EN", hi: "हिन्दी" };
  const btnPad = variant === "floating" ? "px-3 py-2 text-sm" : isHeader ? "px-1.5 py-1 text-[11px]" : "px-2.5 py-1.5";

  const isBn = lang === "bn";
  const isEn = lang === "en";
  const isHi = lang === "hi" || lang === "in";

  return (
    <div className={`${base} ${styles} ${className}`} role="group" aria-label="Language">
      <Globe className={iconClass} />
      <button
        type="button"
        onClick={() => setLang("bn")}
        aria-pressed={isBn}
        aria-label="বাংলা"
        className={`${btnPad} transition ${pill(isBn)}`}
      >{labels.bn}</button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={isEn}
        aria-label="English"
        className={`${btnPad} transition ${pill(isEn)}`}
      >{labels.en}</button>
      <button
        type="button"
        onClick={() => setLang("hi")}
        aria-pressed={isHi}
        aria-label="हिन्दी"
        className={`${btnPad} transition ${pill(isHi)}`}
      >{labels.hi}</button>
    </div>
  );
}

/** Fixed floating language toggle that stays visible while scrolling. */
export function FloatingLanguageToggle() {
  return (
    <div className="fixed left-4 z-50 bottom-20 sm:bottom-6 sm:left-6">
      <LanguageToggle variant="floating" />
    </div>
  );
}