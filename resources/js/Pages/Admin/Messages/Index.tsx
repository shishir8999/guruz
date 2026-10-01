import React, { useState, useRef, useEffect, FormEventHandler } from 'react';
import { Head, useForm, router, Link, usePage } from '@inertiajs/react';
import {
    MessageSquare, Send, Search, User, Phone, Mail, CheckCheck, Loader2, Check,
    ShieldCheck, ShoppingBag, RefreshCw, Zap, Clock, MessageCircle, ArrowRight, Trash2, Globe, Paperclip,
    Play, Pause, Volume2
} from 'lucide-react';
import Swal from 'sweetalert2';

// 🎙️ 1-Click Voice Note Player for Admin Inbox
function AdminVoicePlayer({ url, isMe }: { url: string; isMe: boolean }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.error('Audio play error:', err);
            });
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current && !isNaN(audioRef.current.duration) && isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const formatTime = (secs: number) => {
        if (isNaN(secs) || !isFinite(secs)) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-2xl min-w-[240px] max-w-[320px] select-none shadow-xs border ${
            isMe 
                ? 'bg-slate-800 border-slate-700 text-white' 
                : 'bg-emerald-50 border-emerald-200 text-slate-900'
        }`}>
            <audio 
                ref={audioRef} 
                src={url} 
                onTimeUpdate={handleTimeUpdate} 
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded} 
                preload="metadata"
                className="hidden" 
            />

            {/* Play/Pause Button */}
            <button
                type="button"
                onClick={togglePlay}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 cursor-pointer shadow-md ${
                    isMe 
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title={isPlaying ? 'ভয়েস থামান' : 'ভয়েস শুনুন (এক ক্লিকে)'}
            >
                {isPlaying ? (
                    <Pause size={18} className="fill-current" />
                ) : (
                    <Play size={18} className="fill-current translate-x-0.5" />
                )}
            </button>

            {/* Audio Waveform & Scrubber */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                {/* Waveform Bars */}
                <div 
                    className="flex items-center gap-0.5 h-5 cursor-pointer py-1"
                    onClick={(e) => {
                        if (!audioRef.current || duration === 0) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
                        audioRef.current.currentTime = newPercent * duration;
                    }}
                >
                    {[35, 65, 25, 85, 55, 100, 40, 75, 45, 70, 90, 55, 35, 80, 50, 25].map((h, i) => {
                        const barPercent = (i / 16) * 100;
                        const isFilled = barPercent <= progressPercent;
                        return (
                            <span 
                                key={i} 
                                style={{ height: `${h}%` }}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                    isFilled 
                                        ? (isMe ? 'bg-indigo-400' : 'bg-emerald-600') 
                                        : (isMe ? 'bg-slate-600' : 'bg-emerald-200')
                                }`}
                            />
                        );
                    })}
                </div>

                {/* Duration / Counter */}
                <div className="flex items-center justify-between text-[11px] font-bold leading-none opacity-85 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span className="flex items-center gap-1">
                        <Volume2 size={12} className={isPlaying ? 'animate-pulse text-emerald-600' : ''} />
                        {formatTime(duration || 0)}
                    </span>
                </div>
            </div>
        </div>
    );
}

interface CustomerItem {
    id: string;
    thread_id?: number;
    user_id?: number;
    is_live_thread?: boolean;
    session_id?: string;
    name: string;
    email: string;
    phone: string;
    ip_address?: string;
    current_page?: string;
    avatar_url?: string;
    last_message: string;
    last_message_time: string;
    unread_count: number;
    status?: string;
}

interface MessageItem {
    id: number;
    is_live?: boolean;
    sender_name?: string;
    body: string;
    attachment_url?: string;
    attachment_type?: string;
    is_me: boolean;
    is_read: boolean;
    created_at: string;
}

interface AdminMessagesProps {
    customers: CustomerItem[];
    total_unread_messages?: number;
    total_unread_clients?: number;
    active_user?: {
        id: string;
        thread_id?: number;
        user_id?: number;
        is_live_thread?: boolean;
        session_id?: string;
        name: string;
        email: string;
        phone: string;
        ip_address?: string;
        current_page?: string;
        user_agent?: string;
        avatar_url?: string;
        status?: string;
    } | null;
    conversation: MessageItem[];
}

export default function Index({
    customers = [],
    total_unread_messages = 0,
    total_unread_clients = 0,
    active_user = null,
    conversation = []
}: AdminMessagesProps) {
    const { props } = usePage<any>();
    const siteSettings = props.siteSettings;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'live'>('all');
    const chatBodyRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        thread_id: active_user?.thread_id || '',
        customer_id: active_user?.user_id || '',
        body: '',
    });

    const scrollToBottom = () => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        if (active_user) {
            setData({
                thread_id: active_user.thread_id || '',
                customer_id: active_user.user_id || '',
                body: '',
            });
        }
    }, [active_user]);

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    // 🚀 Real-time Live Polling: Auto refresh customer list and conversation every 4s
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ['customers', 'conversation', 'total_unread_messages', 'total_unread_clients'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const handleSelectChat = (item: CustomerItem) => {
        if (item.is_live_thread && item.thread_id) {
            router.get('/admin/messages', { thread_id: item.thread_id }, { preserveState: true, preserveScroll: true });
        } else if (item.user_id) {
            router.get('/admin/messages', { user_id: item.user_id }, { preserveState: true, preserveScroll: true });
        }
    };

    const handleSendMessage: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.body.trim() || (!data.thread_id && !data.customer_id)) return;

        post('/admin/messages', {
            preserveScroll: true,
            onSuccess: () => {
                reset('body');
                setTimeout(() => scrollToBottom(), 100);
            },
        });
    };

    const handleQuickReply = (text: string) => {
        setData('body', text);
    };

    const handleDeleteThread = (threadId: string | number) => {
        Swal.fire({
            title: 'চ্যাটটি সম্পূর্ণ মুছে ফেলতে চান?',
            text: 'এই চ্যাট থ্রেড ও এর সমস্ত মেসেজ ডাটাবেস থেকে স্থায়ীভাবে ডিলিট হবে!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'বাতিল',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete('/admin/messages/thread/' + threadId, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'চ্যাট ডাটাবেস থেকে স্থায়ীভাবে ডিলিট হয়েছে।',
                            showConfirmButton: false,
                            timer: 2000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const handleDeleteUser = (userId: number, userName: string) => {
        Swal.fire({
            title: 'ইউজার স্থায়ীভাবে ডিলিট করবেন?',
            html: `<div class="text-xs text-slate-600 space-y-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-200"><p>আপনি কি নিশ্চিত যে ইউজার <b>${userName}</b> (ID: #${userId}) এবং তার সমস্ত রেকর্ড (মেসেজ, অর্ডার ইত্যাদি) সম্পূর্ণ ডাটাবেজ থেকে মুছে ফেলতে চান?</p><p class="text-rose-600 font-bold">⚠️ এই কাজটি আর কোনোভাবেই ফিরিয়ে আনা যাবে না!</p></div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, ইউজার সম্পূর্ণ ডিলিট করুন',
            cancelButtonText: 'বাতিল',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete('/admin/messages/user/' + userId, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `ইউজার "${userName}" সফলভাবে মুছে ফেলা হয়েছে!`,
                            showConfirmButton: false,
                            timer: 2500,
                            timerProgressBar: true,
                        });
                    },
                    onError: () => {
                        Swal.fire('ব্যর্থ!', 'ইউজার ডিলিট করা সম্ভব হয়নি।', 'error');
                    }
                });
            }
        });
    };

    const handlePromptDelete = (customer: CustomerItem) => {
        if (customer.is_live_thread && customer.thread_id) {
            handleDeleteThread('live_' + customer.thread_id);
            return;
        }

        if (customer.user_id) {
            Swal.fire({
                title: `${customer.name}`,
                html: `<div class="text-xs text-slate-600 py-1">আপনি কি এই ইউজারের চ্যাট হিস্ট্রি মুছবেন নাকি ইউজার অ্যাকাউন্টটিই সম্পূর্ণ ডিলিট করবেন?</div>`,
                icon: 'question',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                denyButtonColor: '#d97706',
                cancelButtonColor: '#64748b',
                confirmButtonText: '🗑️ ইউজার অ্যাকাউন্ট সম্পূর্ণ ডিলিট',
                denyButtonText: '💬 শুধুমাত্র চ্যাট মুছুন',
                cancelButtonText: 'বাতিল',
            }).then((result) => {
                if (result.isConfirmed) {
                    handleDeleteUser(customer.user_id!, customer.name);
                } else if (result.isDenied) {
                    handleDeleteThread('user_' + customer.user_id);
                }
            });
        }
    };

    const handleDeleteMessage = (msgId: number, isLive: boolean) => {
        Swal.fire({
            title: 'মেসেজটি ডিলিট করতে চান?',
            text: 'এই মেসেজটি ডাটাবেস থেকে স্থায়ীভাবে মুছে ফেলা হবে!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ডিলিট',
            cancelButtonText: 'বাতিল',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete('/admin/messages/message/' + msgId + '?type=' + (isLive ? 'live' : 'user'), {
                    preserveScroll: true,
                });
            }
        });
    };

    const unreadClientsCount = customers.filter(c => (c.unread_count || 0) > 0).length;

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterMode === 'unread') {
            return matchesSearch && (c.unread_count || 0) > 0;
        }
        if (filterMode === 'live') {
            return matchesSearch && c.is_live_thread;
        }
        return matchesSearch;
    });

    const quickReplies = [
        '👋 স্বাগতম! গুরুজ কাস্টমার সাপোর্টে আপনাকে সাহায্য করতে পেরে আনন্দিত।',
        '📦 আপনার অর্ডারটি প্রসেসিংয়ে রয়েছে, খুব শীঘ্রই ডেলিভারির জন্য পাঠানো হবে।',
        '✅ আপনার পেমেন্ট সফলভাবে ভেরিফাই করা হয়েছে, ধন্যবাদ!',
        '📞 আমাদের হেল্পলাইন নম্বরে কল করে সরাসরি কথা বলতে পারেন: 01700000000',
    ];

    return (
        <>
            <Head title="Live Messenger - কাস্টমার সাপোর্ট ইনবক্স" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/50 relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/30 shrink-0">
                            <MessageSquare size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl md:text-2xl font-black tracking-tight">Live Messenger & Support Inbox</h1>
                                {total_unread_messages > 0 && unreadClientsCount > 0 ? (
                                    <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-black rounded-full shadow-lg shadow-rose-500/30 animate-pulse flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                                        {total_unread_messages}টি নতুন মেসেজ ({unreadClientsCount} জন ক্লায়েন্ট)
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black rounded-full flex items-center gap-1.5">
                                        <Check size={13} className="text-emerald-400" /> Live Support Ready
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-1">
                                মেসেঞ্জার-স্টাইল লাইভ চ্যাটে সমস্ত ভিজিটর ও কাস্টমারদের প্রশ্নের রিয়েল-টাইম উত্তর দিন
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Chat Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[700px]">
                    {/* Left Sidebar: Customer List */}
                    <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
                        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="কাস্টমার নাম, ফোন বা ইমেইল খুঁজুন..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition"
                                />
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                                <button
                                    onClick={() => setFilterMode('all')}
                                    className={`flex-1 py-1.5 rounded-lg transition text-center ${
                                        filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    সকল ({customers.length})
                                </button>
                                <button
                                    onClick={() => setFilterMode('live')}
                                    className={`flex-1 py-1.5 rounded-lg transition text-center ${
                                        filterMode === 'live' ? 'bg-white text-indigo-600 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    লাইভ চ্যাট
                                </button>
                                <button
                                    onClick={() => setFilterMode('unread')}
                                    className={`flex-1 py-1.5 rounded-lg transition text-center flex items-center justify-center gap-1 ${
                                        filterMode === 'unread' ? 'bg-rose-500 text-white shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    <span>অপঠিত</span>
                                    {unreadClientsCount > 0 && (
                                        <span className="px-1.5 py-0.2 bg-white text-rose-600 rounded-full text-[10px] font-black">
                                            {unreadClientsCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Customer List Feed */}
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                            {filteredCustomers.length === 0 ? (
                                <div className="p-10 text-center text-slate-400 space-y-2">
                                    <MessageCircle size={36} className="mx-auto text-slate-300" />
                                    <p className="text-xs font-extrabold text-slate-600">কোনো চ্যাট পাওয়া যায়নি</p>
                                </div>
                            ) : (
                                filteredCustomers.map((customer) => {
                                    const isActive = active_user?.id === customer.id;

                                    return (
                                        <div
                                            key={customer.id}
                                            onClick={() => handleSelectChat(customer)}
                                            className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group relative ${
                                                isActive
                                                    ? 'bg-indigo-50/80 border-l-4 border-indigo-600 shadow-xs'
                                                    : 'bg-white hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="relative shrink-0">
                                                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${customer.is_live_thread ? 'from-blue-600 to-indigo-600' : 'from-emerald-600 to-teal-500'} text-white font-black text-sm flex items-center justify-center shadow-xs`}>
                                                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'V'}
                                                    </div>
                                                    <span className={`w-3 h-3 ${customer.is_live_thread ? 'bg-indigo-500' : 'bg-emerald-500'} border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5`}></span>
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <h4 className={`font-black text-xs truncate ${isActive ? 'text-indigo-950' : 'text-slate-900'}`}>
                                                            {customer.name}
                                                        </h4>
                                                        {customer.is_live_thread && (
                                                            <span className="px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-md text-[9px] font-black shrink-0">
                                                                Live
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-[11px] truncate mt-0.5 ${customer.unread_count > 0 ? 'font-extrabold text-slate-900' : 'text-slate-500 font-medium'}`}>
                                                        {customer.last_message}
                                                    </p>
                                                    <div className="flex items-center justify-between gap-2 mt-1">
                                                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                            <Clock size={10} /> {customer.last_message_time}
                                                        </span>
                                                        {customer.unread_count > 0 && (
                                                            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black shrink-0">
                                                                {customer.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Delete Button for each user/session */}
                                            <div className="shrink-0 flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePromptDelete(customer);
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                    title={customer.is_live_thread ? 'লাইভ চ্যাট মুছুন' : 'ইউজার বা চ্যাট মুছুন'}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Main: Active Chat Window */}
                    <div className="lg:col-span-8 flex flex-col h-[700px] bg-white">
                        {active_user ? (
                            <>
                                {/* Header */}
                                <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                                            {active_user.name ? active_user.name.charAt(0).toUpperCase() : 'V'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-base text-slate-900">{active_user.name}</h3>
                                                {active_user.is_live_thread ? (
                                                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-extrabold rounded-md">
                                                        Live Chat Session #{active_user.thread_id}
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-md">
                                                        Customer ID #{active_user.user_id}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium mt-0.5">
                                                <span className="flex items-center gap-1 text-slate-600"><Phone size={12} className="text-slate-400" /> {active_user.phone}</span>
                                                <span className="flex items-center gap-1 text-slate-600"><Globe size={12} className="text-slate-400" /> {active_user.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Delete Thread / Delete User */}
                                    <div className="flex items-center gap-2">
                                        {active_user.is_live_thread && active_user.thread_id ? (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteThread('live_' + active_user.thread_id)}
                                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                                                title="সম্পূর্ণ চ্যাট মুছে ফেলুন"
                                            >
                                                <Trash2 size={13} />
                                                <span>সম্পূর্ণ চ্যাট মুছুন</span>
                                            </button>
                                        ) : active_user.user_id ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteThread('user_' + active_user.user_id)}
                                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-amber-200 cursor-pointer"
                                                    title="এই ইউজারের সমস্ত মেসেজ হিস্ট্রি মুছুন"
                                                >
                                                    <MessageSquare size={13} />
                                                    <span>চ্যাট মুছুন</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteUser(active_user.user_id!, active_user.name)}
                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                                                    title="এই ইউজার অ্যাকাউন্ট স্থায়ীভাবে ডাটাবেজ থেকে ডিলিট করুন"
                                                >
                                                    <Trash2 size={13} />
                                                    <span>ইউজার ডিলিট</span>
                                                </button>
                                            </>
                                        ) : null}
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1">
                                            <ShieldCheck size={14} className="text-emerald-600" /> Live
                                        </span>
                                    </div>
                                </div>

                                {/* 📋 ভিজিটর পূর্ণাঙ্গ তথ্য (নাম, জিমেইল, ফোন, কোথা থেকে/IP, সোর্স পেজ) */}
                                <div className="px-6 py-2.5 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border-b border-indigo-100/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex flex-wrap items-center gap-4 text-slate-700">
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <User size={13} className="text-indigo-600 shrink-0" />
                                            <span className="text-slate-500 font-medium">নাম:</span>
                                            <span className="text-slate-900 font-black">{active_user.name || 'ভিজিটর'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <Mail size={13} className="text-indigo-600 shrink-0" />
                                            <span className="text-slate-500 font-medium">জিমেইল / ইমেইল:</span>
                                            <span className="text-slate-900 font-black select-all">{active_user.email || 'তথ্য নেই'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-bold">
                                            <Phone size={13} className="text-indigo-600 shrink-0" />
                                            <span className="text-slate-500 font-medium">ফোন:</span>
                                            <span className="text-slate-900 font-black select-all">{active_user.phone || 'তথ্য নেই'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                                        {active_user.ip_address && (
                                            <div className="flex items-center gap-1 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs font-mono font-medium" title="কোথা থেকে (IP Address)">
                                                <Globe size={12} className="text-blue-500 shrink-0" />
                                                <span>আইপি: {active_user.ip_address}</span>
                                            </div>
                                        )}
                                        {active_user.current_page && (
                                            <a 
                                                href={active_user.current_page}
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs font-semibold hover:underline max-w-[220px] truncate"
                                                title={`ভিজিটর যে পেজ থেকে মেসেজ দিয়েছে: ${active_user.current_page}`}
                                            >
                                                <ArrowRight size={11} className="text-indigo-500 shrink-0" />
                                                <span className="truncate">সোর্স পেজ</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Message Stream */}
                                <div ref={chatBodyRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/60">
                                    {conversation.length === 0 ? (
                                        <div className="text-center py-16 text-slate-400 space-y-3 max-w-sm mx-auto">
                                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                                <MessageSquare size={32} />
                                            </div>
                                            <h4 className="font-black text-slate-800 text-base">কোনো পূর্ববর্তী মেসেজ নেই</h4>
                                            <p className="text-xs text-slate-500">
                                                নিচে কাস্টমারকে উত্তর পাঠিয়ে লাইভ চ্যাট শুরু করুন!
                                            </p>
                                        </div>
                                    ) : (
                                        conversation.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex items-start gap-2.5 group ${msg.is_me ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {!msg.is_me && (
                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                        {active_user.name ? active_user.name.charAt(0).toUpperCase() : 'V'}
                                                    </div>
                                                )}

                                                <div className="relative max-w-lg">
                                                    <div
                                                        className={`p-3.5 rounded-2xl text-xs space-y-1 shadow-2xs ${
                                                            msg.is_me
                                                                ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-tr-xs'
                                                                : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                                                        }`}
                                                    >
                                                        {/* Attachment */}
                                                        {msg.attachment_url && (
                                                            <div className="mb-2 rounded-xl overflow-hidden">
                                                                {msg.attachment_type === 'image' ? (
                                                                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                                                        <img src={msg.attachment_url} alt="Attachment" className="max-w-[240px] w-full h-auto object-cover hover:scale-105 transition rounded-xl border border-black/10" />
                                                                    </a>
                                                                ) : msg.attachment_type === 'audio' || msg.attachment_url.match(/\.(mp3|wav|ogg|webm|m4a)(\?.*)?$/i) ? (
                                                                    <AdminVoicePlayer url={msg.attachment_url} isMe={!!msg.is_me} />
                                                                ) : (
                                                                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="p-2 flex items-center gap-1.5 text-blue-600 underline font-bold">
                                                                        <Paperclip size={14} /> ডাউনলোড ফাইল
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}

                                                        {msg.body && (
                                                            <p className="leading-relaxed whitespace-pre-wrap text-xs font-medium">{msg.body}</p>
                                                        )}

                                                        <div className={`flex items-center justify-end gap-1 text-[10px] pt-1 ${msg.is_me ? 'text-slate-400' : 'text-slate-400'}`}>
                                                            <span>{msg.created_at}</span>
                                                            {msg.is_me && <CheckCheck size={12} className="text-indigo-400" />}
                                                        </div>
                                                    </div>

                                                    {/* Delete Message Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteMessage(msg.id, !!msg.is_live)}
                                                        className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition shadow-md cursor-pointer"
                                                        title="মেসেজ ডিলিট করুন"
                                                    >
                                                        <Trash2 size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Quick Replies */}
                                <div className="shrink-0 px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                                    <span className="text-[11px] font-bold text-slate-400 shrink-0">কুইক রিপ্লাই:</span>
                                    {quickReplies.map((reply, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuickReply(reply)}
                                            className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-600 rounded-xl text-[11px] font-bold transition shrink-0 cursor-pointer shadow-2xs"
                                        >
                                            {reply.substring(0, 30)}...
                                        </button>
                                    ))}
                                </div>

                                {/* Reply Input Form */}
                                <div className="shrink-0 p-4 border-t border-slate-200 bg-white">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={data.body}
                                            onChange={(e) => setData('body', e.target.value)}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                                            placeholder={`${active_user.name}-কে রিটার্ন উত্তর মেসেজ লিখুন...`}
                                            disabled={processing}
                                        />
                                        <button
                                            type="submit"
                                            disabled={processing || !data.body.trim()}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-2xl text-xs font-black shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <span>পাঠান</span>
                                                    <Send size={14} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                                <MessageSquare size={48} className="text-slate-300" />
                                <h3 className="font-black text-slate-700 text-base">কোনো চ্যাট নির্বাচিত নেই</h3>
                                <p className="text-xs text-slate-500">বাম পাশের তালিকা থেকে একটি চ্যাট নির্বাচন করুন</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
