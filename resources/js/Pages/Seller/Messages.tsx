import React, { useState, useRef, useEffect, FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    MessageCircle, Send, Headphones, Loader2, User, 
    CheckCheck, RefreshCw, ShieldCheck, Clock,
    Store, Zap
} from 'lucide-react';

interface MessageItem {
    id: number;
    body: string;
    is_me: boolean;
    is_admin_reply?: boolean;
    sender_name?: string;
    created_at: string;
}

interface MessagesProps {
    shop?: {
        id: number;
        name: string;
        logo_url?: string | null;
        status?: string;
    } | null;
    admin?: {
        name: string;
        role: string;
        online: boolean;
    };
    messages: MessageItem[];
}

export default function Messages({ shop, admin, messages = [] }: MessagesProps) {
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [liveMessages, setLiveMessages] = useState<MessageItem[]>(messages);
    const [isSending, setIsSending] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>('');

    // Sync when props change
    useEffect(() => {
        setLiveMessages(messages);
    }, [messages]);

    const scrollToBottom = (smooth = true) => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTo({
                top: chatBodyRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    useEffect(() => {
        scrollToBottom(false);
    }, []);

    useEffect(() => {
        scrollToBottom(true);
    }, [liveMessages]);

    // 🔔 Notification sound generator using Web Audio API
    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start(audioCtx.currentTime);
            osc1.stop(audioCtx.currentTime + 0.3);

            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.15);
            gain2.gain.setValueAtTime(0, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(audioCtx.currentTime + 0.15);
            osc2.stop(audioCtx.currentTime + 0.5);

            setTimeout(() => audioCtx.close(), 600);
        } catch (e) {
            // Audio context not allowed or supported
        }
    };

    // 🔄 Live Polling every 3 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const lastId = liveMessages.length > 0 ? Math.max(...liveMessages.map(m => m.id)) : 0;
                const res = await fetch(`/seller/messages/poll?after_id=${lastId}`, {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.new_messages && data.new_messages.length > 0) {
                        const hasAdminReply = data.new_messages.some((m: any) => m.is_admin_reply);
                        setLiveMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const trulyNew = data.new_messages.filter((m: any) => !existingIds.has(m.id));
                            if (trulyNew.length === 0) return prev;
                            return [...prev, ...trulyNew];
                        });

                        if (hasAdminReply) {
                            playNotificationSound();
                        }
                    }
                }
            } catch (err) {
                // Ignore network glitch
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [liveMessages]);

    // Send message
    const handleSendMessage = async (customText?: string) => {
        const text = (customText !== undefined ? customText : inputValue).trim();
        if (!text || isSending) return;

        setIsSending(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch('/seller/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ body: text }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.message) {
                    setLiveMessages(prev => [...prev, data.message]);
                }
                setInputValue('');
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickTemplates = [
        'আমার শপের স্ট্যাটাস ও ভেরিফিকেশন জানতে চাই',
        'নতুন প্রোডাক্ট এপ্রুভাল এর বিষয়ে সহায়তা প্রয়োজন',
        'উইথড্রয়াল / পেমেন্ট সংক্রান্ত তথ্য চাই',
        'অর্ডার শিপিং এবং কুরিয়ার সেটিংস হেল্প লাগবে',
        'ধন্যবাদ, সবকিছু ঠিক আছে!'
    ];

    return (
        <>
            <Head title="লাইভ সাপোর্ট ও মেসেজ - Seller Panel" />

            <div className="max-w-6xl mx-auto space-y-4">
                {/* Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                <Headphones className="w-6 h-6" />
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" title="অনলাইন" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-black text-slate-900 dark:text-white">
                                    {admin?.name || 'Guruz সুপার এডমিন সাপোর্ট'}
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    সরাসরি লাইভ কানেক্টেড
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                <span>{admin?.role || 'প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেশন'}</span>
                                <span>•</span>
                                <span className="text-teal-600 dark:text-teal-400 font-medium">২৪/৭ ভেন্ডর সহায়তা কেন্দ্র</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {shop && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                                <Store className="w-3.5 h-3.5 text-teal-500" />
                                <span className="font-semibold">{shop.name}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>অফিসিয়াল চ্যানেল</span>
                        </div>
                    </div>
                </div>

                {/* Chat Box Container */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
                    
                    {/* Chat Messages List */}
                    <div 
                        ref={chatBodyRef}
                        className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40"
                    >
                        {/* Welcome announcement banner */}
                        <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/50 rounded-2xl text-center max-w-xl mx-auto shadow-xs">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300 mb-2">
                                <Headphones className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold text-teal-950 dark:text-teal-200">
                                Guruz ভেন্ডর লাইভ চ্যাট হেল্পডেস্কে স্বাগতম!
                            </h3>
                            <p className="text-[11px] text-teal-800 dark:text-teal-300/80 mt-1 leading-relaxed">
                                আপনার শপ সংক্রান্ত যেকোনো প্রশ্ন, এপ্রুভাল তথ্য, প্রোডাক্ট তালিকাভুক্তিকরণ বা পেমেন্ট সমস্যার জন্য এডমিনকে সরাসরি বার্তা দিন।
                            </p>
                        </div>

                        {liveMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 dark:text-slate-500">
                                <MessageCircle className="w-12 h-12 stroke-[1.2] mb-2 text-slate-300 dark:text-slate-600" />
                                <p className="text-sm font-semibold">এখনো কোনো মেসেজ নেই</p>
                                <p className="text-xs mt-1">এডমিনকে একটি বার্তা পাঠিয়ে আলোচনা শুরু করুন।</p>
                            </div>
                        ) : (
                            liveMessages.map((msg) => {
                                const isMe = msg.is_me;
                                return (
                                    <div 
                                        key={msg.id}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                                    >
                                        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                                            {!isMe && (
                                                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mb-1" title="সুপার এডমিন">
                                                    A
                                                </div>
                                            )}

                                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs ${
                                                isMe 
                                                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-xs' 
                                                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                                            }`}>
                                                <div className="whitespace-pre-wrap break-words">
                                                    {msg.body}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 px-1 ${isMe ? 'pr-1' : 'pl-9'}`}>
                                            <Clock className="w-2.5 h-2.5" />
                                            <span>{msg.created_at}</span>
                                            {isMe && (
                                                <CheckCheck className="w-3 h-3 text-teal-500 ml-0.5" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-500" />
                            কুইক মেসেজ:
                        </span>
                        {quickTemplates.map((template, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleSendMessage(template)}
                                disabled={isSending}
                                className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-slate-700 hover:border-teal-300 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap transition cursor-pointer shrink-0 disabled:opacity-50"
                            >
                                {template}
                            </button>
                        ))}
                    </div>

                    {/* Message Composer Area */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }} 
                            className="flex items-end gap-2"
                        >
                            <div className="relative flex-1">
                                <textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    placeholder="আপনার মেসেজ লিখুন... (Enter চাপলে সেন্ড হবে, Shift+Enter নতুন লাইন)"
                                    className="w-full resize-none px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder:text-slate-400 dark:placeholder:text-slate-500 max-h-32"
                                    style={{ minHeight: '46px' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isSending}
                                className="h-[46px] px-5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 shrink-0"
                            >
                                {isSending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>সেন্ড</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}

Messages.layout = (page: any) => <SellerLayout children={page} />;