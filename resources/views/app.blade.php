<!DOCTYPE html>
<html lang="bn">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name', 'Guruz E-Commerce') }}</title>

        <!-- Prevent Google Translate and browser extensions from crashing React DOM manipulation -->
        <script>
            if (typeof Node === 'function' && Node.prototype) {
                var originalInsertBefore = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function (newNode, referenceNode) {
                    if (referenceNode && referenceNode.parentNode !== this) {
                        return originalInsertBefore.call(this, newNode, null);
                    }
                    return originalInsertBefore.call(this, newNode, referenceNode);
                };

                var originalRemoveChild = Node.prototype.removeChild;
                Node.prototype.removeChild = function (child) {
                    if (child.parentNode !== this) {
                        return child;
                    }
                    return originalRemoveChild.call(this, child);
                };
            }
        </script>
        
        <!-- Dynamic Website Favicon (Browser Tab Icon) -->
        <link rel="icon" type="image/x-icon" href="{{ \App\Models\SiteSetting::get('site_favicon') ? asset(\App\Models\SiteSetting::get('site_favicon')) : (\App\Models\SiteSetting::get('site_logo') ? asset(\App\Models\SiteSetting::get('site_logo')) : asset('favicon.ico')) }}">
        <link rel="shortcut icon" href="{{ \App\Models\SiteSetting::get('site_favicon') ? asset(\App\Models\SiteSetting::get('site_favicon')) : (\App\Models\SiteSetting::get('site_logo') ? asset(\App\Models\SiteSetting::get('site_logo')) : asset('favicon.ico')) }}">
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet">

        @php
            $themeSettingsMap = \Illuminate\Support\Facades\Cache::remember('all_site_settings_map', 600, function() {
                try {
                    return \App\Models\SiteSetting::pluck('value', 'key')->toArray();
                } catch (\Throwable $e) {
                    return [];
                }
            });
        @endphp
        <style id="global-theme-variables">
        :root {
            --theme-primary: {{ $themeSettingsMap['theme_primary_color'] ?? '#16a34a' }};
            --theme-primary-dark: {{ $themeSettingsMap['theme_primary_dark'] ?? '#15803d' }};
            --theme-primary-text: {{ $themeSettingsMap['theme_primary_text'] ?? '#ffffff' }};
            --theme-accent: {{ $themeSettingsMap['theme_accent_color'] ?? '#22c9a3' }};
            --theme-badge-bg: {{ $themeSettingsMap['theme_badge_bg'] ?? '#f97316' }};
            --theme-sale-bg: {{ $themeSettingsMap['theme_sale_bg'] ?? '#ef4444' }};
            --theme-navy: {{ $themeSettingsMap['theme_navy_color'] ?? '#0f2033' }};
            --theme-header-bg: {{ $themeSettingsMap['theme_header_bg'] ?? '#0f2033' }};
            --theme-header-text: {{ $themeSettingsMap['theme_header_text'] ?? '#ffffff' }};
            --theme-search-bg: {{ $themeSettingsMap['theme_search_bg'] ?? '#383333' }};
            --theme-search-text: {{ $themeSettingsMap['theme_search_text'] ?? '#ffffff' }};
            --theme-announcement-bg: {{ $themeSettingsMap['theme_announcement_bg'] ?? '#16a34a' }};
            --theme-announcement-text: {{ $themeSettingsMap['theme_announcement_text'] ?? '#ffffff' }};
            --theme-notice-from: {{ $themeSettingsMap['theme_notice_from'] ?? '#fbbf24' }};
            --theme-notice-via: {{ $themeSettingsMap['theme_notice_via'] ?? '#f97316' }};
            --theme-notice-to: {{ $themeSettingsMap['theme_notice_to'] ?? '#f43f5e' }};
            --theme-notice-text: {{ $themeSettingsMap['theme_notice_text'] ?? '#ffffff' }};
            --theme-footer-bg: {{ $themeSettingsMap['theme_footer_bg'] ?? '#0f2033' }};
            --theme-footer-text: {{ $themeSettingsMap['theme_footer_text'] ?? '#ffffff' }};
            --theme-page-bg: {{ $themeSettingsMap['theme_page_bg'] ?? '#ffffff' }};
            --theme-page-text: {{ $themeSettingsMap['theme_page_text'] ?? '#0a0f1c' }};
            --theme-card-bg: {{ $themeSettingsMap['theme_card_bg'] ?? '#ffffff' }};
            --theme-card-text: {{ $themeSettingsMap['theme_card_text'] ?? '#0a0f1c' }};
            --theme-popover-bg: {{ $themeSettingsMap['theme_popover_bg'] ?? '#ffffff' }};
            --theme-popover-text: {{ $themeSettingsMap['theme_popover_text'] ?? '#0a0f1c' }};
            --theme-secondary-bg: {{ $themeSettingsMap['theme_secondary_bg'] ?? '#f1f5f9' }};
            --theme-secondary-text: {{ $themeSettingsMap['theme_secondary_text'] ?? '#0f2033' }};
            --theme-accent-bg: {{ $themeSettingsMap['theme_accent_bg'] ?? '#f1f5f9' }};
            --theme-accent-text: {{ $themeSettingsMap['theme_accent_text'] ?? '#1e293b' }};
            --theme-muted-bg: {{ $themeSettingsMap['theme_muted_bg'] ?? '#f1f5f9' }};
            --theme-muted-text: {{ $themeSettingsMap['theme_muted_text'] ?? '#64748b' }};
            --theme-border-color: {{ $themeSettingsMap['theme_border_color'] ?? '#e2e8f0' }};
            --theme-input-border: {{ $themeSettingsMap['theme_input_border'] ?? '#e2e8f0' }};
            --theme-focus-ring: {{ $themeSettingsMap['theme_focus_ring'] ?? '#94a3b8' }};
            --theme-danger-bg: {{ $themeSettingsMap['theme_danger_bg'] ?? '#ef4444' }};
            --theme-danger-text: {{ $themeSettingsMap['theme_danger_text'] ?? '#ffffff' }};
            --theme-sidebar-bg: {{ $themeSettingsMap['theme_sidebar_bg'] ?? '#242628' }};
            --theme-sidebar-text: {{ $themeSettingsMap['theme_sidebar_text'] ?? '#ffffff' }};
            --theme-sidebar-active-bg: {{ $themeSettingsMap['theme_sidebar_active_bg'] ?? '#1e293b' }};
            --theme-sidebar-active-text: {{ $themeSettingsMap['theme_sidebar_active_text'] ?? '#f8fafc' }};
            --theme-sidebar-hover-bg: {{ $themeSettingsMap['theme_sidebar_hover_bg'] ?? '#f1f5f9' }};
            --theme-sidebar-hover-text: {{ $themeSettingsMap['theme_sidebar_hover_text'] ?? '#1e293b' }};
            --theme-sidebar-border: {{ $themeSettingsMap['theme_sidebar_border'] ?? '#e2e8f0' }};
        }
        </style>

        <!-- Universal Google Translate Script for Any Language Translation -->
        <script type="text/javascript">
            function clearAndSetGoogtrans(targetLang) {
                var raw = targetLang || 'bn';
                if (typeof raw === 'string' && raw.indexOf('{') !== -1) {
                    try {
                        var p = JSON.parse(raw);
                        raw = p && p.state && p.state.lang ? p.state.lang : 'bn';
                    } catch(e) {}
                }
                var lang = String(raw).toLowerCase();
                if (lang === 'in') lang = 'hi';

                var hostname = window.location.hostname;
                var isIpOrLocal = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === 'localhost';
                var domainParts = hostname.split('.');
                var rootDomain = (!isIpOrLocal && domainParts.length > 1) ? '.' + domainParts.slice(-2).join('.') : '';
                
                var cookieDomains = [hostname, rootDomain, ''];
                var cookiePaths = ['/', ''];
                
                for (var d = 0; d < cookieDomains.length; d++) {
                    if (!cookieDomains[d] && cookieDomains[d] !== '') continue;
                    for (var p = 0; p < cookiePaths.length; p++) {
                        var domainClause = cookieDomains[d] ? '; domain=' + cookieDomains[d] : '';
                        var pathClause = cookiePaths[p] ? '; path=' + cookiePaths[p] : '';
                        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC' + pathClause + domainClause + ';';
                    }
                }

                if (lang && lang !== 'bn') {
                    var targetVal = '/bn/' + lang;
                    var autoVal = '/auto/' + lang;
                    document.cookie = 'googtrans=' + targetVal + '; path=/;';
                    if (rootDomain) {
                        document.cookie = 'googtrans=' + targetVal + '; path=/; domain=' + rootDomain + ';';
                    }
                }
            }

            (function() {
                try {
                    var savedLang = localStorage.getItem('site_language') || localStorage.getItem('app_lang');
                    if (savedLang) {
                        clearAndSetGoogtrans(savedLang);
                    }
                } catch(e) {}
            })();

            function googleTranslateElementInit() {
                try {
                    new google.translate.TranslateElement({
                        pageLanguage: 'bn',
                        includedLanguages: 'bn,en,hi',
                        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false
                    }, 'google_translate_element');
                } catch(e) {}
            }

            window.addEventListener('DOMContentLoaded', function() {
                try {
                    var savedLang = localStorage.getItem('site_language') || localStorage.getItem('app_lang');
                    if (savedLang && savedLang !== 'bn') {
                        var gLang = savedLang === 'in' ? 'hi' : savedLang;
                        var attempts = 0;
                        var checkInterval = setInterval(function() {
                            attempts++;
                            var select = document.querySelector('.goog-te-combo');
                            if (select) {
                                if (select.value !== gLang) {
                                    select.value = gLang;
                                    select.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                                clearInterval(checkInterval);
                            }
                            if (attempts > 30) clearInterval(checkInterval);
                        }, 250);
                    }
                } catch(e) {}
            });

            window.changeSiteLanguage = function(targetLang) {
                var lang = String(targetLang || 'bn').toLowerCase();
                var cleanLang = (lang === 'hi' ? 'in' : lang);
                try {
                    localStorage.setItem('site_language', cleanLang);
                    localStorage.setItem('app_lang', cleanLang);
                    localStorage.setItem('app-lang-detected', 'USER_SET');
                } catch(e) {}

                var gLang = cleanLang === 'in' ? 'hi' : cleanLang;
                clearAndSetGoogtrans(gLang);

                // Try to change select combo directly
                var select = document.querySelector('.goog-te-combo');
                if (select) {
                    select.value = gLang === 'bn' ? '' : gLang;
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                }

                setTimeout(function() {
                    window.location.reload();
                }, 120);
            };

            window.setWebsiteLanguage = window.changeSiteLanguage;

            // 🛡️ Auto-correct Google Translate transliteration of 'গুরুজ' -> 'Guruj' to official 'Guruz'
            (function() {
                var isFixing = false;
                function fixGuruzText(text) {
                    if (!text || typeof text !== 'string') return text;
                    return text.replace(/\bGuruj\b/g, 'Guruz').replace(/\bguruj\b/g, 'guruz');
                }

                function walkAndFix(node) {
                    if (!node) return;
                    if (node.nodeType === 3) {
                        if (node.nodeValue && /\bGuruj\b/i.test(node.nodeValue)) {
                            node.nodeValue = fixGuruzText(node.nodeValue);
                        }
                    } else if (node.nodeType === 1) {
                        if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'IFRAME') return;
                        for (var i = 0; i < node.childNodes.length; i++) {
                            walkAndFix(node.childNodes[i]);
                        }
                    }
                }

                var observer = new MutationObserver(function(mutations) {
                    if (isFixing) return;
                    isFixing = true;
                    try {
                        for (var i = 0; i < mutations.length; i++) {
                            var m = mutations[i];
                            if (m.type === 'characterData') {
                                if (m.target && m.target.nodeValue && /\bGuruj\b/i.test(m.target.nodeValue)) {
                                    m.target.nodeValue = fixGuruzText(m.target.nodeValue);
                                }
                            } else if (m.type === 'childList') {
                                for (var j = 0; j < m.addedNodes.length; j++) {
                                    walkAndFix(m.addedNodes[j]);
                                }
                            }
                        }
                    } finally {
                        setTimeout(function() { isFixing = false; }, 80);
                    }
                });

                document.addEventListener('DOMContentLoaded', function() {
                    observer.observe(document.body || document.documentElement, {
                        childList: true,
                        subtree: true,
                        characterData: true
                    });
                });
            })();
        </script>
        <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>

        <style>
            /* Position Google Translate element invisibly offscreen so it fully instantiates */
            #google_translate_element {
                position: absolute !important;
                left: -99999px !important;
                top: -99999px !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }

            /* 🚫 Completely eliminate all Google Translate floating popup widgets, spinners, banners, and tooltips */
            .goog-te-banner-frame,
            iframe.goog-te-banner-frame,
            .goog-te-banner-frame.skiptranslate,
            #goog-gt-tt,
            #goog-gt-vt,
            [id*="goog-gt-"],
            .goog-te-balloon-frame,
            .goog-tooltip,
            .goog-tooltip:hover,
            .goog-te-gadget-icon,
            .goog-te-spinner,
            .goog-te-spinner-pos,
            .goog-te-spinner-animation,
            .VIpgJd-ZVi9od-ORHb, 
            .VIpgJd-ZVi9od-ORHb-OEVmcd, 
            .VIpgJd-ZVi9od-aZ2wEe, 
            .VIpgJd-ZVi9od-aZ2wEe-OiiCO, 
            .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, 
            .VIpgJd-ZVi9od-vH1Gmf, 
            .VIpgJd-ZVi9od-l4eHX-hSRGPd, 
            .VIpgJd-yAWNEb-L7lbkb, 
            .VIpgJd-ZVi9od-xl07Ob-lTBxed,
            .VIpgJd-ZVi9od-xl07Ob-OEVmcd,
            .VIpgJd-yD054b-VGnKid-support-links,
            .VIpgJd-yD054b-y25Nvf,
            .VIpgJd-ZVi9od-vH1Gmf-ibnC6b,
            [class*="VIpgJd-ZVi9od"],
            [class*="VIpgJd-"],
            .skiptranslate:not(#google_translate_element) {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                max-height: 0 !important;
                max-width: 0 !important;
                opacity: 0 !important;
                pointer-events: none !important;
                overflow: hidden !important;
                position: absolute !important;
                left: -99999px !important;
                top: -99999px !important;
                z-index: -99999 !important;
            }

            body {
                top: 0px !important;
                position: static !important;
            }

            html, body {
                margin-top: 0px !important;
                padding-top: 0px !important;
            }

            /* Ensure all translated text highlights remain clean and transparent */
            .goog-text-highlight {
                background-color: transparent !important;
                box-shadow: none !important;
                border: none !important;
            }
        </style>

        <script>
            // 🚫 Continuously remove and suppress Google Translate floating banner, spinner & tooltip popups
            (function() {
                var selectors = [
                    'iframe.goog-te-banner-frame',
                    '.goog-te-banner-frame',
                    '#goog-gt-tt',
                    '#goog-gt-vt',
                    '.goog-te-balloon-frame',
                    '.goog-te-spinner-pos',
                    '.goog-te-spinner',
                    '.goog-te-spinner-animation',
                    '[class*="VIpgJd-ZVi9od-aZ2wEe"]',
                    '[class*="VIpgJd-"]',
                    '.skiptranslate:not(#google_translate_element)'
                ].join(', ');

                function purgeTranslateUI() {
                    try {
                        var nodes = document.querySelectorAll(selectors);
                        for (var i = 0; i < nodes.length; i++) {
                            var el = nodes[i];
                            if (el.id !== 'google_translate_element' && !el.closest('#google_translate_element')) {
                                el.remove();
                            }
                        }
                        if (document.body && document.body.style.top && document.body.style.top !== '0px') {
                            document.body.style.setProperty('top', '0px', 'important');
                        }
                    } catch(e) {}
                }

                var uiObserver = new MutationObserver(purgeTranslateUI);
                if (document.documentElement) {
                    uiObserver.observe(document.documentElement, { childList: true, subtree: true });
                }
                document.addEventListener('DOMContentLoaded', purgeTranslateUI);
                window.addEventListener('load', purgeTranslateUI);
                setInterval(purgeTranslateUI, 200);
            })();
        </script>

        <!-- Integrations (Head) -->
        @if(!empty($integrations['gtm_id']))
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','{{ $integrations['gtm_id'] }}');</script>
        <!-- End Google Tag Manager -->
        @endif

        @if(!empty($integrations['ga4_id']))
        <!-- Google Analytics 4 -->
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $integrations['ga4_id'] }}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '{{ $integrations['ga4_id'] }}');
        </script>
        <!-- End Google Analytics 4 -->
        @endif

        @if(!empty($integrations['fb_pixel_id']))
        <!-- Meta Pixel Code -->
        <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '{{ $integrations['fb_pixel_id'] }}');
        fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id={{ $integrations['fb_pixel_id'] }}&ev=PageView&noscript=1"
        /></noscript>
        <!-- End Meta Pixel Code -->
        @endif

        @if(!empty($integrations['tiktok_pixel_id']))
        <!-- TikTok Pixel -->
        <script>
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
          ttq.load('{{ $integrations['tiktok_pixel_id'] }}');
          ttq.page();
        }(window, document, 'ttq');
        </script>
        <!-- End TikTok Pixel -->
        @endif

        @if(!empty($integrations['custom_header_script']))
        <!-- Custom Header Script -->
        {!! $integrations['custom_header_script'] !!}
        <!-- End Custom Header Script -->
        @endif

        @php
            $host = request()->getHost();
            $isLocalDev = app()->environment('local') 
                && in_array($host, ['localhost', '127.0.0.1', '::1']) 
                && !request()->isSecure() 
                && file_exists(public_path('hot'));

            // Auto-clean hot file if accidentally uploaded to live domain / production
            if (!$isLocalDev && file_exists(public_path('hot')) && !in_array($host, ['localhost', '127.0.0.1', '::1'])) {
                @unlink(public_path('hot'));
            }
        @endphp

        @if($isLocalDev)
            @viteReactRefresh
            @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @else
            @php
                $manifestPath = public_path('build/manifest.json');
                $manifest = file_exists($manifestPath) ? json_decode(file_get_contents($manifestPath), true) : [];
                $appJs = $manifest['resources/js/app.tsx']['file'] ?? null;
                $appCss = $manifest['resources/css/app.css']['file'] ?? ($manifest['resources/js/app.tsx']['css'][0] ?? null);
            @endphp
            @if($appCss)
                <link rel="stylesheet" href="{{ asset('build/' . $appCss) }}">
            @endif
            @if($appJs)
                <script type="module" src="{{ asset('build/' . $appJs) }}"></script>
            @else
                @vite(['resources/css/app.css', 'resources/js/app.tsx'])
            @endif
        @endif

        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-background text-foreground">
        @if(!empty($integrations['custom_body_script']))
        <!-- Custom Body Script -->
        {!! $integrations['custom_body_script'] !!}
        <!-- End Custom Body Script -->
        @endif
        <!-- Integrations (Body) -->
        @if(!empty($integrations['gtm_id']))
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $integrations['gtm_id'] }}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
        @endif

        <div id="google_translate_element" style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden; opacity: 0;"></div>
        @inertia
    </body>
</html>
