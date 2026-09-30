import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { UserCheck, ChevronsRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const FIELDS = ["full_name", "phone", "birthday", "avatar_url"] as const;

export function ProfileCompletionBanner() {
  const { user } = useAuth();
  const { lang } = useI18n();

  const { data } = useQuery({
    enabled: !!user?.id,
    queryKey: ["profile-completion", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name,phone,birthday,avatar_url")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
    staleTime: 30_000,
  });

  if (!user) return null;

  const row = (data ?? {}) as Record<string, unknown>;
  const filled = FIELDS.filter((f) => {
    const v = row[f];
    return typeof v === "string" ? v.trim().length > 0 : !!v;
  }).length;
  const percent = Math.round((filled / FIELDS.length) * 100);
  if (percent >= 100) return null;

  const title =
    lang === "bn"
      ? `আপনার প্রোফাইল ${percent}% সম্পূর্ণ হয়েছে। সম্পূর্ণ করুন এবং পান অতিরিক্ত ২% ডিসকাউন্ট!`
      : `Your profile is ${percent}% complete. Complete it and get an extra 2% discount!`;

  return (
    <Link
      to="/account/profile"
      className="group relative flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-2.5 py-2 shadow-sm hover:shadow-md transition-shadow"
      aria-label={title}
    >
      <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center text-white shadow">
        <UserCheck className="w-3.5 h-3.5" />
      </span>
      <span className="flex-1 min-w-0 text-[12px] sm:text-sm font-semibold leading-snug text-amber-900 line-clamp-2">
        {title}
      </span>
      <ChevronsRight className="shrink-0 w-5 h-5 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  );
}