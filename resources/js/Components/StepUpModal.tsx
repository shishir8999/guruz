import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { verifyStepUp } from "@/lib/step-up.functions";
import { toast } from "sonner";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";

type Props = {
  open: boolean;
  scope?: string;
  title?: string;
  description?: string;
  onClose: () => void;
  onVerified: () => void;
};

export function StepUpModal({ open, scope = "general", title, description, onClose, onVerified }: Props) {
  const verify = useServerFn(verifyStepUp);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    try {
      await verify({ data: { password, scope } });
      setPassword("");
      toast.success("Verified — you can now proceed");
      onVerified();
    } catch (err: any) {
      toast.error(err?.message || "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{title ?? "Confirm your password"}</h3>
            <p className="text-xs text-slate-500">
              {description ?? "This sensitive action requires re-authentication."}
            </p>
          </div>
        </div>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            placeholder="Your current password"
            className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !password}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />} Verify
          </button>
        </div>
        <p className="text-[11px] text-slate-400 text-center">
          Valid for 5 minutes after verification.
        </p>
      </form>
    </div>
  );
}