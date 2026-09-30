import { PartyPopper, X } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";

const copy: Record<Lang, { title: string; body: string; cta: string; badge: string }> = {
  bn: {
    badge: "স্বাগতম!",
    title: "অভিনন্দন! 🎉",
    body: "আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন কেনাকাটা শুরু করুন এবং বিশেষ অফার উপভোগ করুন।",
    cta: "শুরু করুন",
  },
  en: {
    badge: "Welcome!",
    title: "Congratulations! 🎉",
    body: "Your account has been created successfully. Start shopping and enjoy exclusive offers.",
    cta: "Get started",
  },
  hi: {
    badge: "स्वागत है!",
    title: "बधाई हो! 🎉",
    body: "आपका अकाउंट सफलतापूर्वक बन गया है। अभी खरीदारी शुरू करें और खास ऑफ़र का आनंद लें।",
    cta: "शुरू करें",
  },
};

export function WelcomePopup({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useI18n();
  if (!open) return null;
  const c = copy[lang];
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-background shadow-2xl animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background px-6 pt-8 pb-6 text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <PartyPopper className="h-8 w-8" />
          </div>
          <div className="mt-3 inline-block rounded-full bg-primary/15 px-3 py-0.5 text-xs font-semibold text-primary">
            {c.badge}
          </div>
          <h2 className="mt-2 text-xl font-bold">{c.title}</h2>
        </div>
        <div className="px-6 pb-6 pt-2 text-center">
          <p className="text-sm text-muted-foreground">{c.body}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {c.cta}
          </button>
        </div>
      </div>
    </div>
  );
}