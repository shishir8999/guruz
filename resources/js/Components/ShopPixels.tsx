import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Pixels = {
  facebook_pixel_id: string | null;
  google_analytics_id: string | null;
  tiktok_pixel_id: string | null;
  facebook_pixel_script: string | null;
  google_analytics_script: string | null;
  tiktok_pixel_script: string | null;
  custom_head_scripts: string | null;
};

/**
 * Injects a shop's own Facebook Pixel / Google Analytics / TikTok Pixel
 * on the shop and product pages. Loads on the client only.
 */
export function ShopPixels({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ["shop-pixels", slug],
    queryFn: async (): Promise<Pixels | null> => {
      const { data } = await (supabase.from("shops") as any)
        .select("facebook_pixel_id, google_analytics_id, tiktok_pixel_id, facebook_pixel_script, google_analytics_script, tiktok_pixel_script, custom_head_scripts")
        .eq("slug", slug).maybeSingle();
      return (data as Pixels) ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!data) return;
    const cleanups: Array<() => void> = [];

    // Helper: inject arbitrary HTML (script/noscript tags) into <head>
    const injectHtml = (html: string, dedupKey: string) => {
      const map = ((window as any).__shopRawInjected ??= {});
      if (map[dedupKey]) return;
      map[dedupKey] = true;
      const tpl = document.createElement("template");
      tpl.innerHTML = html;
      const added: Element[] = [];
      tpl.content.childNodes.forEach((n) => {
        if (n.nodeType === 1) {
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
        }
      });
      cleanups.push(() => added.forEach((el) => el.remove()));
    };

    // Facebook Pixel
    const fbScript = (data.facebook_pixel_script ?? "").trim();
    const fb = (data.facebook_pixel_id ?? "").trim();
    if (fbScript) {
      injectHtml(fbScript, "fb:" + fbScript.length + ":" + fbScript.slice(0, 40));
    } else if (fb && !(window as any).__shopFbLoaded?.[fb]) {
      (window as any).__shopFbLoaded = { ...((window as any).__shopFbLoaded ?? {}), [fb]: true };
      const s = document.createElement("script");
      s.async = true;
      s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb}');fbq('track','PageView');`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    } else if (fb && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }

    // Google Analytics (GA4 or UA)
    const gaScript = (data.google_analytics_script ?? "").trim();
    const ga = (data.google_analytics_id ?? "").trim();
    if (gaScript) {
      injectHtml(gaScript, "ga:" + gaScript.length + ":" + gaScript.slice(0, 40));
    } else if (ga && !(window as any).__shopGaLoaded?.[ga]) {
      (window as any).__shopGaLoaded = { ...((window as any).__shopGaLoaded ?? {}), [ga]: true };
      const s1 = document.createElement("script");
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;
      document.head.appendChild(s1);
      const s2 = document.createElement("script");
      s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`;
      document.head.appendChild(s2);
      cleanups.push(() => { s1.remove(); s2.remove(); });
    } else if (ga && (window as any).gtag) {
      (window as any).gtag("event", "page_view");
    }

    // TikTok Pixel
    const ttScript = (data.tiktok_pixel_script ?? "").trim();
    const tt = (data.tiktok_pixel_id ?? "").trim();
    if (ttScript) {
      injectHtml(ttScript, "tt:" + ttScript.length + ":" + ttScript.slice(0, 40));
    } else if (tt && !(window as any).__shopTtLoaded?.[tt]) {
      (window as any).__shopTtLoaded = { ...((window as any).__shopTtLoaded ?? {}), [tt]: true };
      const s = document.createElement("script");
      s.innerHTML = `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tt}');ttq.page();}(window, document, 'ttq');`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    } else if (tt && (window as any).ttq) {
      (window as any).ttq.page();
    }

    // Custom head scripts (arbitrary tracking snippets)
    const custom = (data.custom_head_scripts ?? "").trim();
    if (custom) injectHtml(custom, "custom:" + custom.length + ":" + custom.slice(0, 40));

    return () => cleanups.forEach((c) => c());
  }, [
    data?.facebook_pixel_id, data?.google_analytics_id, data?.tiktok_pixel_id,
    data?.facebook_pixel_script, data?.google_analytics_script, data?.tiktok_pixel_script,
    data?.custom_head_scripts,
  ]);

  return null;
}