import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StaticSection = {
  heading_en?: string;
  heading_bn?: string;
  body_en?: ReactNode;
  body_bn?: ReactNode;
};

export function StaticPage({
  title_en,
  title_bn,
  subtitle_en,
  subtitle_bn,
  sections,
  children,
}: {
  title_en: string;
  title_bn: string;
  subtitle_en?: string;
  subtitle_bn?: string;
  sections?: StaticSection[];
  children?: ReactNode;
}) {
  const { lang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const slug = pathname.replace(/^\/+|\/+$/g, "") || "home";

  const { data: override } = useQuery({
    queryKey: ["cms_page_override", slug],
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await (supabase.from("cms_pages") as any)
        .select("content, is_published, title, meta_description")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      return (data ?? null) as
        | { content: any; is_published: boolean; title: string; meta_description: string | null }
        | null;
    },
  });

  const c = override?.content ?? {};
  const title = (lang === "bn" ? c.title_bn : c.title_en) || (lang === "bn" ? title_bn : title_en);
  const subtitle =
    (lang === "bn" ? c.subtitle_bn : c.subtitle_en) || (lang === "bn" ? subtitle_bn : subtitle_en);
  const bodyHtml = lang === "bn" ? c.body_html_bn : c.body_html_en;
  return (
    <main className="min-h-[60vh] bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <nav className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <Link to="/" className="hover:text-foreground">
              {lang === "bn" ? "হোম" : "Home"}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{title}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-muted-foreground max-w-3xl">{subtitle}</p>}
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <article className="prose prose-slate max-w-none">
          {bodyHtml ? (
            <div
              className="text-[15px] leading-7 text-foreground/80 space-y-3"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          ) : sections?.map((s, i) => (
            <section key={i} className="mb-8">
              {(s.heading_en || s.heading_bn) && (
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-6 mb-3">
                  {lang === "bn" ? s.heading_bn : s.heading_en}
                </h2>
              )}
              <div className="text-[15px] leading-7 text-foreground/80 space-y-3">
                {lang === "bn" ? s.body_bn : s.body_en}
              </div>
            </section>
          ))}
          {!bodyHtml && children}
        </article>
      </div>
    </main>
  );
}

export function pageHead(title: string, description: string, path?: string) {
  const fullTitle = `${title} — Guruz`;
  const url = path ? `https://guruzbd.com${path}` : undefined;
  return () => ({
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      ...(url ? [{ property: "og:url", content: url }] : []),
    ],
    ...(url ? { links: [{ rel: "canonical", href: url }] } : {}),
  });
}