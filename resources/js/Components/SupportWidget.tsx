import React, { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Headphones, Phone, Mail, MessageCircle, Send, X, ShieldCheck, Clock, MessageSquareText } from 'lucide-react';
import { MessengerLiveChat } from '@/Components/MessengerLiveChat';

interface SupportWidgetProps {
    enabled?: boolean;
    color?: string;
    position?: string;
    greeting?: string;
    whatsapp?: string;
    messenger?: string;
    phone?: string;
    email?: string;
    whatsapp_icon?: string | null;
    messenger_icon?: string | null;
    livechat_icon?: string | null;
}

export function SupportWidget() {
    const { props } = usePage<any>();
    const siteSettings = props.siteSettings || {};
    const cfg: SupportWidgetProps = siteSettings.support_widget || {};

    const [open, setOpen] = useState(false);
    const [showLiveModal, setShowLiveModal] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    const isEnabled = cfg.enabled ?? true;

    // Clean and normalize WhatsApp number (ensure 8801XXXXXXXXX for BD)
    let rawWa = (cfg.whatsapp || '01982708789').trim();
    let cleanWa = rawWa.replace(/\D/g, '');
    if (cleanWa.startsWith('01') && cleanWa.length === 11) {
        cleanWa = '88' + cleanWa;
    }
    const whatsappUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent('হ্যালো! আমি Guruz প্রোডাক্ট ও সাপোর্ট সম্পর্কে তথ্য জানতে চাই।')}`;

    // Clean and normalize Messenger link
    let rawMessenger = (cfg.messenger || 'guruzbd').trim();
    let messengerUrl = rawMessenger;
    if (!messengerUrl.startsWith('http://') && !messengerUrl.startsWith('https://')) {
        messengerUrl = `https://m.me/${encodeURIComponent(messengerUrl.replace(/^@/, ''))}`;
    }

    const phoneNum = (cfg.phone || '01700000000').trim();
    const emailAddr = (cfg.email || 'support@guruz.com.bd').trim();
    const greetingMsg = cfg.greeting || '২৪/৭ কাস্টমার সাপোর্ট — যেকোনো প্রয়োজনে আমরা আপনার সাথে আছি!';
    const widgetColor = cfg.color || '#4f46e5';
    const isLeft = cfg.position === 'bottom-left';

    // Close on outside click or ESC key
    useEffect(() => {
        if (!open && !showLiveModal) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                setShowLiveModal(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, showLiveModal]);

    if (!isEnabled) return null;

    return (
        <div 
            ref={wrapRef} 
            className={`fixed z-[9999] ${isLeft ? 'left-3.5 sm:left-6 items-start' : 'right-3.5 sm:right-6 items-end'} bottom-[4.5rem] sm:bottom-6 pointer-events-auto flex flex-col`}
        >
            {/* ─── STACKED FLOATING ACTION PILLS ─── */}
            {open && (
                <div className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'} gap-2.5 mb-3 animate-in fade-in slide-in-from-bottom-5 duration-200`}>
                    
                    {/* 1. Messenger Pill (Blue) */}
                    <a
                        href={messengerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-[#0084FF] to-[#00C6FF] hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    >
                        {cfg.messenger_icon ? (
                            <img src={cfg.messenger_icon} alt="Messenger" className="w-5 h-5 object-contain rounded-full bg-white/10" />
                        ) : (
                            <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.082.3 2.235.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z" />
                            </svg>
                        )}
                        <span>মেসেঞ্জার</span>
                    </a>

                    {/* 2. WhatsApp Pill (Green) */}
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    >
                        {cfg.whatsapp_icon ? (
                            <img src={cfg.whatsapp_icon} alt="WhatsApp" className="w-5 h-5 object-contain rounded-full bg-white/10" />
                        ) : (
                            <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                        )}
                        <span>হোয়াটসঅ্যাপ</span>
                    </a>

                    {/* 3. Call Hotline (Amber) */}
                    {phoneNum && (
                        <a
                            href={`tel:${phoneNum}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                        >
                            <Phone className="w-4 h-4" />
                            <span>কল করুন ({phoneNum})</span>
                        </a>
                    )}

                    {/* 4. Live Chat Pill (Purple/Custom) */}
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            setShowLiveModal(true);
                        }}
                        className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    >
                        {cfg.livechat_icon ? (
                            <img src={cfg.livechat_icon} alt="Live Chat" className="w-5 h-5 object-contain rounded-full bg-white/10" />
                        ) : (
                            <Headphones className="w-5 h-5 text-white shrink-0" />
                        )}
                        <span>লাইভ চ্যাট</span>
                    </button>

                </div>
            )}

            {/* ─── LIVE MESSENGER CHAT BOX ─── */}
            <MessengerLiveChat 
                isOpen={showLiveModal} 
                onClose={() => setShowLiveModal(false)} 
            />

            {/* ─── FLOATING CIRCULAR TRIGGER BUTTON ─── */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Customer Support"
                style={!open ? { backgroundColor: widgetColor } : {}}
                className={`relative flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-full text-white shadow-xl border-2 border-white/30 transition-all duration-300 group cursor-pointer ${
                    open ? 'bg-slate-800 rotate-90 scale-95' : 'hover:scale-105 active:scale-95'
                }`}
            >
                {!open && (
                    <span 
                        aria-hidden
                        style={{ backgroundColor: widgetColor }}
                        className="absolute inset-0 rounded-full opacity-60 animate-ping pointer-events-none"
                    />
                )}
                {open ? (
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[3]" />
                ) : (
                    <Headphones className="w-5 h-5 sm:w-6.5 sm:h-6.5 text-white stroke-[2.5] group-hover:rotate-12 transition-transform" />
                )}
            </button>

        </div>
    );
}