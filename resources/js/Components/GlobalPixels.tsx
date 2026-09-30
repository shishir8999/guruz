import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type PublicPixels = {
  facebook_pixel_id?: string | null;
  google_analytics_id?: string | null; // GA4 measurement ID e.g. G-XXXX
  google_tag_manager?: string | null;  // GTM-XXXXXXX
  tiktok_pixel_id?: string | null;
  custom_head_scripts?: string | null;
};

function injectHtml(html: string, dedupKey: string, cleanups: Array<() => void>) {
  const map = ((window as any).__guruzRawInjected ??= {});
  if (map[dedupKey]) return;
  map[dedupKey] = true;
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const added: Element[] = [];
  tpl.content.childNodes.forEach((n) => {
    if (n.nodeType !== 1) return;
    const el = n as Element;
    if (el.tagName === "SCRIPT") {
      const s = document.createElement("script");
      for (const a of Array.from(el.attributes)) s.setAttribute(a.name, a.value);
      s.text = el.textContent ?? "";
      document.head.appendChild(s);
      added.push(s);
    } else {
      const clone = el.cloneNode(true) as Element;
      document.head.appendChild(clone);
      added.push(clone);
    }
  });
  cleanups.push(() => added.forEach((el) => el.remove()));
}

/**
 * Site-wide marketing pixel loader.
 * Reads `app_settings` where key='integrations_public' (is_public=true).
 * Injects Facebook Pixel, GTM, GA4, TikTok Pixel + any custom snippets.
 * Fires PageView on every client-side route change.
 */
export function GlobalPixels() {
  const routerState = useRouterState({ select: (s) => s.location.href });

  const { data } = useQuery({
    queryKey: ["global-pixels"],
    queryFn: async (): Promise<PublicPixels> => {
      const { data } = await (supabase.from as any)("app_settings")
        .select("value").eq("key", "integrations_public").maybeSingle();
      return (data?.value as PublicPixels) ?? {};
    },
    staleTime: 10 * 60 * 1000,
  });

  // Inject scripts once when config arrives.
  useEffect(() => {
    if (!data || typeof window === "undefined") return;
    const cleanups: Array<() => void> = [];

    const fb = (data.facebook_pixel_id ?? "").trim();
    if (fb && !(window as any).__guruzFbLoaded) {
      (window as any).__guruzFbLoaded = true;
      const s = document.createElement("script");
      s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb}');fbq('track','PageView');`;
      document.head.appendChild(s);
      const noscript = document.createElement("noscript");
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${fb}&ev=PageView&noscript=1" alt=""/>`;
      document.head.appendChild(noscript);
      cleanups.push(() => { s.remove(); noscript.remove(); });
    }

    const gtm = (data.google_tag_manager ?? "").trim();
    if (gtm && !(window as any).__guruzGtmLoaded) {
      (window as any).__guruzGtmLoaded = true;
      const s = document.createElement("script");
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    }

    const ga = (data.google_analytics_id ?? "").trim();
    if (ga && !(window as any).__guruzGaLoaded) {
      (window as any).__guruzGaLoaded = true;
      const s1 = document.createElement("script");
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;
      document.head.appendChild(s1);
      const s2 = document.createElement("script");
      s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}',{send_page_view:true});`;
      document.head.appendChild(s2);
      cleanups.push(() => { s1.remove(); s2.remove(); });
    }

    const tt = (data.tiktok_pixel_id ?? "").trim();
    if (tt && !(window as any).__guruzTtLoaded) {
      (window as any).__guruzTtLoaded = true;
      const s = document.createElement("script");
      s.innerHTML = `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tt}');ttq.page();}(window, document, 'ttq');`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    }

    const custom = (data.custom_head_scripts ?? "").trim();
    if (custom) injectHtml(custom, "gcustom:" + custom.length, cleanups);

    return () => cleanups.forEach((c) => c());
  }, [data?.facebook_pixel_id, data?.google_tag_manager, data?.google_analytics_id, data?.tiktok_pixel_id, data?.custom_head_scripts]);

  // Fire PageView on SPA navigation.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { (window as any).fbq?.("track", "PageView"); } catch { /* noop */ }
    try { (window as any).ttq?.page(); } catch { /* noop */ }
    try {
      const ga = (data?.google_analytics_id ?? "").trim();
      if (ga && (window as any).gtag) (window as any).gtag("event", "page_view", { page_path: window.location.pathname + window.location.search });
    } catch { /* noop */ }
  }, [routerState, data?.google_analytics_id]);

  return null;
}
