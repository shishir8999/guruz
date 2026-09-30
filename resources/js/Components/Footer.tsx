import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle, Music2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { SupportWidget } from '@/Components/SupportWidget';
import { MobileBottomNav } from '@/Components/MobileBottomNav';
import { LiveVisitorCounter } from '@/Components/LiveVisitorCounter';

function SocialIcon({ platform }: { platform: string }) {
    const p = platform.toLowerCase();
    const cls = 'w-3.5 h-3.5';
    if (p.includes('facebook')) return <Facebook className={cls} />;
    if (p.includes('instagram')) return <Instagram className={cls} />;
    if (p.includes('youtube')) return <Youtube className={cls} />;
    if (p.includes('linkedin')) return <Linkedin className={cls} />;
    if (p.includes('tiktok')) return <Music2 className={cls} />;
    if (p.includes('whatsapp')) return <MessageCircle className={cls} />;
    return <span className="text-xs font-bold">#</span>;
}

const AppleIcon = () => (
    <svg viewBox="0 0 384 512" fill="currentColor" className="w-5 h-5 text-white">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
);

const GooglePlayIcon = () => (
    <svg viewBox="0 0 512 512" fill="currentColor" className="w-5 h-5 text-white">
        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
);

export function Footer({ widgets: propWidgets, settings: propSettings }: { widgets?: any[], settings?: any }) {
    const { props } = usePage<any>();
    const widgets = propWidgets && propWidgets.length > 0 ? propWidgets : (props.footerWidgets || []);
    const settings = propSettings && Object.keys(propSettings).length > 0 ? propSettings : (props.settings || {});
    
    const formatSocialUrl = (url: string | undefined, defaultUrl: string) => {
        if (!url || url === '#' || url.trim() === '') return defaultUrl;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    const socials = [
        { platform: 'facebook', label: 'Facebook', url: formatSocialUrl(settings.footer_facebook, 'https://facebook.com') },
        { platform: 'instagram', label: 'Instagram', url: formatSocialUrl(settings.footer_instagram, 'https://instagram.com') },
        { platform: 'youtube', label: 'Youtube', url: formatSocialUrl(settings.footer_youtube, 'https://youtube.com') },
        { platform: 'linkedin', label: 'Linkedin', url: formatSocialUrl(settings.footer_linkedin, 'https://linkedin.com') },
        { platform: 'tiktok', label: 'Tik Tok', url: formatSocialUrl(settings.footer_tiktok, 'https://tiktok.com') },
        { platform: 'pinterest', label: 'Pinterest', url: formatSocialUrl(settings.footer_pinterest, 'https://pinterest.com') },
        { 
            platform: 'whatsapp', 
            label: 'WhatsApp', 
            url: settings.footer_whatsapp 
                ? (settings.footer_whatsapp.startsWith('http') ? settings.footer_whatsapp : `https://wa.me/${settings.footer_whatsapp.replace(/[^0-9]/g, '')}`) 
                : 'https://whatsapp.com' 
        },
    ];

    return (
        <>
            <footer 
                style={{
                    backgroundColor: 'var(--theme-footer-bg, #0f2033)',
                    color: 'var(--theme-footer-text, #cccccc)',
                }}
                className="mt-6 sm:mt-8 text-xs font-sans relative pb-20 md:pb-1"
            >
                <div className="mx-auto max-w-7xl px-4 pt-6 pb-2">
                    {/* Top 5 Column Navigation Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 border-b border-gray-800/80 pb-6">
                        
                        {/* Dynamic Footer Widgets (4 Columns) */}
                        {widgets.slice(0, 4).map((widget: any, index: number) => (
                            <div key={widget.id || index}>
                                {index === 0 ? (
                                    settings?.site_logo ? (
                                        <img src={settings.site_logo} alt={settings.site_title || 'Logo'} className="max-h-8 object-contain mb-3" />
                                    ) : (
                                        <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
                                            GURUZ<span className="text-emerald-500">BD</span>
                                        </h4>
                                    )
                                ) : (
                                    <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">{widget.title}</h4>
                                )}
                                <ul className="space-y-1.5">
                                    {(widget.links || []).map((link: any) => {
                                        const isExternal = link.url && (link.url.startsWith('http://') || link.url.startsWith('https://'));
                                        return (
                                            <li key={link.id || link.label}>
                                                {isExternal ? (
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-white transition-colors duration-150"
                                                    >
                                                        {link.label}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={link.url || '#'}
                                                        className="hover:text-white transition-colors duration-150"
                                                    >
                                                        {link.label}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}

                        {/* Socials Column (5th Column) */}
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Connect With Us</h4>
                            <ul className="grid grid-cols-2 gap-y-2 md:grid-cols-1 md:gap-y-1.5">
                                {socials.map(s => (
                                    <li key={s.platform}>
                                        <a
                                            href={s.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-white transition-colors duration-150 flex items-center gap-2 text-[#cccccc] cursor-pointer"
                                        >
                                            <div className="text-gray-400 shrink-0">
                                                <SocialIcon platform={s.platform} />
                                            </div>
                                            <span className="capitalize font-medium">{s.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* App Banner Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="relative bg-white rounded-lg p-1.5 shadow-md shrink-0">
                                <img
                                    src="/app-qr-code.jpg"
                                    alt="Scan to Download GURUZ App"
                                    className="w-14 h-14 object-cover rounded-md"
                                />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                    GURUZ Shopping App
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <p className="text-[11px] text-[#999999] mt-0.5">
                                    স্ক্যান করে অ্যাপ ডাউনলোড করুন <span className="text-emerald-400 font-semibold">(Android &amp; iOS)</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <a 
                                href={formatSocialUrl(settings.footer_play_store, 'https://play.google.com')} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-gradient-to-br from-emerald-600 to-teal-700 hover:scale-105 transition-all px-3 py-1.5 rounded-lg shadow-md border border-emerald-500/20"
                            >
                                <GooglePlayIcon />
                                <div className="flex flex-col text-white">
                                    <span className="text-[9px] font-medium uppercase leading-none opacity-80">GET IT ON</span>
                                    <span className="font-bold text-xs leading-tight">Google Play</span>
                                </div>
                            </a>

                            <a 
                                href={formatSocialUrl(settings.footer_app_store, 'https://apple.com/app-store')} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-700 hover:scale-105 transition-all px-3 py-1.5 rounded-lg shadow-md border border-blue-500/20"
                            >
                                <AppleIcon />
                                <div className="flex flex-col text-white">
                                    <span className="text-[9px] font-medium uppercase leading-none opacity-80">DOWNLOAD ON THE</span>
                                    <span className="font-bold text-xs leading-tight">App Store</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Bottom Copyright & Payment Methods Bar */}
                    <div className="border-t border-gray-800/60 mt-3 pt-3 pb-1 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
                        <div>
                            {settings.footer_copyright || (
                                <span>
                                    © 2026 GURUZ All rights reserved. | Website Designed with{' '}
                                    <a 
                                        href="https://www.facebook.com/shishir9barai" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="font-bold text-white underline decoration-emerald-500 underline-offset-2 hover:text-emerald-400 transition-colors"
                                    >
                                        SHISHIR
                                    </a>
                                </span>
                            )}
                        </div>

                        {/* Payment Methods */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 font-medium mr-2 text-[11px]">পেমেন্ট মেথড</span>
                            <img 
                                src="/payment-methods.png" 
                                alt="Payment Methods" 
                                className="h-6 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </footer>

            {/* Recent Purchase Toast (Shop Name, Customer Name, Product Details) */}
            <LiveVisitorCounter />

            {/* Customer Floating Support Widget */}
            <SupportWidget />

            {/* Global Mobile Bottom Navigation Bar */}
            <MobileBottomNav />
        </>
    );
}
