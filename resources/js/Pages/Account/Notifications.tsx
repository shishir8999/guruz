import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Bell, Package, Tag, Info, ArrowLeft, CheckCheck, 
    Cake, Megaphone, Clock, Check, ExternalLink, ShieldAlert, Copy
} from 'lucide-react';
import { useI18nStore } from '@/lib/i18n';
import axios from 'axios';
import Swal from 'sweetalert2';

interface NotificationItem {
    id: number | string;
    type: string;
    title: string;
    body: string;
    link?: string | null;
    icon?: string;
    is_read: boolean;
    created_at: string;
}

export default function Notifications({ notifications: initialNotifications = [] }: { notifications: NotificationItem[] }) {
    const { lang } = useI18nStore();
    const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Automatically mark all notifications as read immediately once user opens the notifications page
    useEffect(() => {
        // Optimistically mark all current notifications as read
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        
        // Sync with backend immediately
        axios.post('/account/notifications/read-all').catch(() => {});

        // Store timestamp in localStorage and broadcast event across components
        if (typeof window !== 'undefined') {
            localStorage.setItem('customer_notifications_cleared_at', Date.now().toString());
            window.dispatchEvent(new CustomEvent('customer-notifications-cleared'));
        }
    }, []);

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    const markAsRead = async (id: number | string) => {
        try {
            await axios.post(`/account/notifications/${id}/read`);
            setNotifications(prev => {
                const next = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
                if (next.every(n => n.is_read)) {
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('customer_notifications_cleared_at', Date.now().toString());
                        window.dispatchEvent(new CustomEvent('customer-notifications-cleared'));
                    }
                }
                return next;
            });
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = () => {
        router.post('/account/notifications/read-all', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                if (typeof window !== 'undefined') {
                    localStorage.setItem('customer_notifications_cleared_at', Date.now().toString());
                    window.dispatchEvent(new CustomEvent('customer-notifications-cleared'));
                }
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'সকল নোটিফিকেশন পড়া হয়েছে!',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        });
    };

    const getIcon = (type: string, title?: string) => {
        const lowerTitle = (title || '').toLowerCase();
        if (type === 'birthday' || lowerTitle.includes('জন্মদিন') || lowerTitle.includes('birthday')) {
            return (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Cake className="w-5 h-5 animate-bounce" />
                </div>
            );
        }
        if (type === 'offer' || lowerTitle.includes('অফার') || lowerTitle.includes('কুপন') || lowerTitle.includes('discount')) {
            return (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Tag className="w-5 h-5" />
                </div>
            );
        }
        if (type === 'order' || lowerTitle.includes('অর্ডার') || lowerTitle.includes('order')) {
            return (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Package className="w-5 h-5" />
                </div>
            );
        }
        if (type === 'system' || lowerTitle.includes('ঘোষণা') || lowerTitle.includes('notice')) {
            return (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Megaphone className="w-5 h-5" />
                </div>
            );
        }
        return (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <Bell className="w-5 h-5" />
            </div>
        );
    };

    return (
        <>
            <Head title={lang === 'bn' ? 'নোটিফিকেশন — Notifications' : 'Notifications'} />

            <div className="space-y-6 max-w-5xl">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-500/20 relative">
                            <Bell className="w-6 h-6" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-ping" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <span>Notifications (নোটিফিকেশন)</span>
                                {unreadCount > 0 ? (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold flex items-center gap-1 animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                        {unreadCount}টি নতুন
                                    </span>
                                ) : (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-extrabold">
                                        {notifications.length}টি মোট
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                আপনার জন্য পাঠানো সকল জরুরি আপডেট, অফার, জন্মদিনের শুভেচ্ছা ও সিস্টেম নোটিফিকেশন
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                <CheckCheck className="w-4 h-4 text-emerald-600" />
                                <span>সব পঠিত চিহ্নিত করুন</span>
                            </button>
                        )}
                        <Link
                            href="/account"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition active:scale-95 shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 text-emerald-400" />
                            <span>অ্যাকাউন্ট মেনু</span>
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 px-1">
                    <button
                        type="button"
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition cursor-pointer ${
                            filter === 'all'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        সকল নোটিফিকেশন ({notifications.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                            filter === 'unread'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-red-50 border border-slate-200'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${unreadCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                        নতুন / অপঠিত ({unreadCount})
                    </button>
                </div>

                {/* Notifications List */}
                <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-300">
                                <Bell className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="font-extrabold text-slate-700 text-base">কোনো নোটিফিকেশন নেই</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {filter === 'unread' ? 'আপনার সকল নোটিফিকেশন ইতিমধ্যে পড়া হয়েছে।' : 'নতুন কোনো নোটিফিকেশন আসলে এখানে দেখতে পাবেন।'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredNotifications.map((notif) => {
                                const isUnread = !notif.is_read;
                                return (
                                    <div 
                                        key={notif.id} 
                                        className={`p-5 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer ${
                                            isUnread 
                                                ? 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-red-500' 
                                                : 'hover:bg-slate-50/80'
                                        }`}
                                        onClick={() => isUnread && markAsRead(notif.id)}
                                    >
                                        <div className="flex items-start gap-4">
                                            {getIcon(notif.type, notif.title)}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className={`font-black text-sm sm:text-base ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    {isUnread && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white shadow-xs animate-pulse">
                                                            নতুন
                                                        </span>
                                                    )}
                                                </div>

                                                <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${isUnread ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                                                    {notif.body}
                                                </p>

                                                {(() => {
                                                    // Extract coupon code if present in body or title
                                                    const textContent = `${notif.title || ''} ${notif.body || ''}`;
                                                    const couponMatch = textContent.match(/(?:কুপন(?:\s*কোড)?|coupon(?:\s*code)?|কোড)\s*[:：\-]\s*([A-Za-z0-9_\-]+)/i);
                                                    const detectedCoupon = couponMatch ? couponMatch[1] : null;

                                                    // Calculate correct destination link
                                                    let destLink = '/account/offers';
                                                    if (notif.link && notif.link !== '/account/notifications' && notif.link !== '#' && notif.link !== '/') {
                                                        destLink = notif.link.startsWith('/offers') ? '/account/offers' : notif.link;
                                                    }

                                                    const isOfferOrGift = notif.type === 'offer' || notif.type === 'birthday' || Boolean(notif.link) || Boolean(detectedCoupon);

                                                    if (!isOfferOrGift) return null;

                                                    return (
                                                        <div className="pt-2.5 flex flex-wrap items-center gap-2">
                                                            <Link
                                                                href={destLink}
                                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (isUnread) markAsRead(notif.id);
                                                                }}
                                                            >
                                                                <span>অফার ও গিফট কুপন দেখুন</span>
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </Link>

                                                            {detectedCoupon && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigator.clipboard.writeText(detectedCoupon);
                                                                        Swal.fire({
                                                                            toast: true,
                                                                            position: 'top-end',
                                                                            icon: 'success',
                                                                            title: `কুপন কোড "${detectedCoupon}" কপি হয়েছে! 🎉`,
                                                                            showConfirmButton: false,
                                                                            timer: 2000
                                                                        });
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-black border border-amber-200 transition active:scale-95 cursor-pointer shadow-2xs"
                                                                >
                                                                    <Copy className="w-3.5 h-3.5 text-amber-600" />
                                                                    <span>কপি কুপন: {detectedCoupon}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })()}

                                                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>
                                                        {new Date(notif.created_at).toLocaleString('bn-BD', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                            {isUnread ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notif.id);
                                                    }}
                                                    className="p-1.5 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl text-slate-400 transition"
                                                    title="পঠিত হিসেবে চিহ্নিত করুন"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                    পঠিত
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}