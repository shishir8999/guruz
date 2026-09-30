import React, { useState, useRef, useEffect, FormEventHandler } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { MessageCircle, Send, Headphones, ArrowLeft, Loader2, User, CheckCheck, Pencil, X, Check } from 'lucide-react';
import Swal from 'sweetalert2';

interface MessageData {
    id: number;
    body: string;
    is_me: boolean;
    is_admin_reply?: boolean;
    created_at: string;
}

export default function Messages({ messages = [], admin_avatar = null }: { messages: MessageData[]; admin_avatar?: string | null }) {
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        body: '',
    });

    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [editBody, setEditBody] = useState<string>('');
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [liveMessages, setLiveMessages] = useState<MessageData[]>(messages);

    // Sync with server props when they change
    useEffect(() => {
        setLiveMessages(messages);
    }, [messages]);

    // Automatically mark all messages as read on mount
    useEffect(() => {
        fetch('/account/messages/mark-read', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        }).catch(() => {});
    }, []);

    const scrollToBottom = () => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [liveMessages]);

    // 🔔 Notification sound generator using Web Audio API (no external file needed)
    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // First tone (higher pitch)
            const osc1 = audioCtx.createOscillator();
            const gain1 = audioCtx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc1.connect(gain1);
            gain1.connect(audioCtx.destination);
            osc1.start(audioCtx.currentTime);
            osc1.stop(audioCtx.currentTime + 0.3);

            // Second tone (even higher, delayed slightly)
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
            gain2.gain.setValueAtTime(0, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start(audioCtx.currentTime + 0.15);
            osc2.stop(audioCtx.currentTime + 0.5);

            // Cleanup
            setTimeout(() => audioCtx.close(), 600);
        } catch (e) {
            // Silently fail if audio not supported
        }
    };

    // 🔄 Real-time message polling every 5 seconds
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const lastId = liveMessages.length > 0 ? Math.max(...liveMessages.map(m => m.id)) : 0;
                const res = await fetch(`/account/messages/poll?after_id=${lastId}`, {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.new_messages && data.new_messages.length > 0) {
                        // Check if any new messages are from admin (support reply)
                        const hasAdminReply = data.new_messages.some((m: any) => m.is_admin_reply);
                        
                        setLiveMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const truly_new = data.new_messages.filter((m: any) => !existingIds.has(m.id));
                            if (truly_new.length === 0) return prev;
                            return [...prev, ...truly_new];
                        });

                        // Play notification sound for admin replies
                        if (hasAdminReply) {
                            playNotificationSound();
                        }
                    }
                }
            } catch (e) {
                // Silently fail on network errors
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [liveMessages]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.body.trim()) return;

        post('/account/messages', {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                setTimeout(() => {
                    scrollToBottom();
                }, 100);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'মেসেজ পাঠানো হয়েছে! 💬',
                    showConfirmButton: false,
                    timer: 2000,
                });
            },
        });
    };

    const handleStartEdit = (msg: MessageData) => {
        setEditingMessageId(msg.id);
        setEditBody(msg.body);
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditBody('');
    };

    const handleSaveEdit = (msgId: number) => {
        if (!editBody.trim()) return;
        setIsUpdating(true);

        router.put(`/account/messages/${msgId}`, { body: editBody.trim() }, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingMessageId(null);
                setEditBody('');
                setIsUpdating(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'মেসেজ পরিবর্তন করা হয়েছে! ✏️',
                    showConfirmButton: false,
                    timer: 2000,
                });
            },
            onError: () => {
                setIsUpdating(false);
            }
        });
    };

    return (
        <>
            <Head title="Support & Messages - কাস্টমার সাপোর্ট" />

            <div className="space-y-6 w-full">
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <span>Support & Messages</span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center gap-1">
                                    <Check size={11} /> Live Support Active
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                আপনার যেকোনো সাহায্য বা প্রশ্নের সরাসরি উত্তর পেতে সুপার অ্যাডমিন লাইভ চ্যাটে যুক্ত থাকুন
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm transition active:scale-95 w-full sm:w-auto shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-emerald-400" />
                        <span>ওয়েবসাইটে ফিরুন</span>
                    </Link>
                </div>

                {/* Main Chat Box Container - Full Width */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden flex flex-col h-[560px] w-full">
                    
                    {/* Top Support Info Bar */}
                    <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md border border-slate-700 overflow-hidden">
                                    {admin_avatar ? (
                                        <img src={admin_avatar} alt="Super Admin" className="w-full h-full object-cover" />
                                    ) : (
                                        <Headphones size={20} className="text-emerald-400" />
                                    )}
                                </div>
                                <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5"></span>
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm text-slate-900">গুরুজ অফিশিয়াল সাপোর্ট হেল্পডেস্ক</h3>
                                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                                    ● অনলাইন (সুপার অ্যাডমিন সরাসরি উত্তরে প্রস্তুত)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Scroll Feed */}
                    <div ref={chatBodyRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
                        
                        {/* Always show welcome message from support */}
                        <div className="flex items-start gap-3 max-w-[88%] sm:max-w-2xl">
                            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md border border-slate-700 overflow-hidden">
                                {admin_avatar ? (
                                    <img src={admin_avatar} alt="Super Admin" className="w-full h-full object-cover" />
                                ) : (
                                    <Headphones size={18} className="text-emerald-400" />
                                )}
                            </div>
                            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 shadow-xs text-xs text-slate-800 space-y-1.5">
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>গুরুজ সাপোর্ট টিম (সাপোর্ট)</span>
                                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">Official Helpdesk</span>
                                </p>
                                <p className="leading-relaxed">
                                    নমস্কার! আমাদের কাস্টমার সাপোর্টে আপনাকে স্বাগতম। আপনার অর্ডার, পেমেন্ট বা সার্ভিস সংক্রান্ত যেকোনো প্রশ্ন নিচে লিখে পাঠান, আমরা সাহায্য করতে প্রস্তুত!
                                </p>
                                <span className="text-[10px] text-slate-400 block pt-1 font-medium">আজকের সাহায্য সেবা</span>
                            </div>
                        </div>

                        {liveMessages.map((msg) => {
                            const isAdminReply = msg.is_admin_reply || !msg.is_me;

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex items-start gap-3 ${
                                        isAdminReply ? 'justify-start' : 'justify-end'
                                    }`}
                                >
                                    {/* Super Admin Reply Avatar on LEFT Side */}
                                    {isAdminReply && (
                                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md border border-slate-700 overflow-hidden">
                                            {admin_avatar ? (
                                                <img src={admin_avatar} alt="Super Admin" className="w-full h-full object-cover" />
                                            ) : (
                                                <Headphones size={20} className="text-emerald-400" />
                                            )}
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div
                                        className={`max-w-[88%] sm:max-w-2xl p-4 rounded-2xl text-xs space-y-1.5 shadow-sm transition-all group ${
                                            isAdminReply
                                                ? 'bg-white border-2 border-slate-200/90 text-slate-900 rounded-tl-xs font-medium shadow-sm'
                                                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-tr-xs font-medium'
                                        }`}
                                    >
                                        {/* Inline Edit Form if active */}
                                        {editingMessageId === msg.id ? (
                                            <div className="space-y-2 py-1">
                                                <textarea
                                                    value={editBody}
                                                    onChange={(e) => setEditBody(e.target.value)}
                                                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                                    rows={2}
                                                />
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <X size={12} />
                                                        <span>বাতিল</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveEdit(msg.id)}
                                                        disabled={isUpdating || !editBody.trim()}
                                                        className="px-3 py-1 bg-emerald-950 hover:bg-black text-white rounded-lg text-[11px] font-black transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                    >
                                                        {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                        <span>সেভ করুন</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                                                
                                                <div className={`flex items-center justify-end gap-2 text-[10px] pt-0.5 ${
                                                    isAdminReply ? 'text-slate-400' : 'text-emerald-100'
                                                }`}>
                                                    <span>{msg.created_at}</span>
                                                    {!isAdminReply && <CheckCheck size={13} className="text-emerald-200" />}

                                                    {/* Customer Edit Message Option ONLY for customer's own sent messages */}
                                                    {!isAdminReply && (
                                                        <button
                                                            onClick={() => handleStartEdit(msg)}
                                                            title="মেসেজটি এডিট করুন"
                                                            className="ml-1 opacity-70 hover:opacity-100 hover:scale-110 transition cursor-pointer text-white flex items-center gap-0.5 bg-white/20 px-1.5 py-0.5 rounded-md"
                                                        >
                                                            <Pencil size={10} />
                                                            <span className="text-[9px] font-bold">এডিট</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Customer's Own Avatar on RIGHT Side */}
                                    {!isAdminReply && (
                                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-md">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Customer Message Input Box Form */}
                    <div className="p-4 bg-white border-t border-slate-200/80">
                        <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full max-w-none">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={data.body}
                                    onChange={(e) => setData('body', e.target.value)}
                                    className="w-full bg-slate-50/90 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition shadow-2xs placeholder:text-slate-400"
                                    placeholder="একটি মেসেজ লিখুন (Write message here)..."
                                    disabled={processing}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing || !data.body.trim()}
                                className="px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2 shrink-0"
                            >
                                {processing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>পাঠান</span>
                                        <Send size={15} />
                                    </>
                                )}
                            </button>
                        </form>
                        {errors.body && (
                            <p className="text-xs text-rose-500 font-medium text-center mt-2">{errors.body}</p>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}
