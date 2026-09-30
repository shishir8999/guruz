import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { 
    Headphones, MessageSquare, Send, CheckCircle2, CheckCheck, Clock, 
    AlertTriangle, XCircle, Search, Filter, RefreshCw, 
    Trash2, Eye, ShieldCheck, User, Store, ArrowRight, X 
} from 'lucide-react';
import Swal from 'sweetalert2';

interface TicketItem {
    id: number;
    ticket_number: string;
    shop_id: number;
    user_id: number;
    subject: string;
    category: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    description: string;
    admin_reply: string | null;
    is_read?: boolean;
    admin_seen_at?: string | null;
    created_at: string;
    updated_at: string;
    shop?: {
        id: number;
        name: string;
        slug: string;
        logo?: string | null;
        logo_url?: string | null;
    };
    user?: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
}

interface Props {
    tickets: {
        data: TicketItem[];
        links: any[];
        total: number;
    };
    counts: {
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function SupportTicketsPage({ tickets, counts, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [viewingTicket, setViewingTicket] = useState<TicketItem | null>(null);
    const [ticketList, setTicketList] = useState<TicketItem[]>(tickets.data);

    useEffect(() => {
        setTicketList(tickets.data);
    }, [tickets.data]);

    const { data: replyData, setData: setReplyData, post: postReply, processing: replyProcessing, reset: resetReply } = useForm({
        reply_message: '',
        status: 'In Progress',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/vendor-tickets', {
            search: searchTerm,
            status: statusFilter,
        }, { preserveState: true });
    };

    const handleStatusFilterChange = (st: string) => {
        setStatusFilter(st);
        router.get('/admin/vendor-tickets', {
            search: searchTerm,
            status: st,
        }, { preserveState: true });
    };

    const openTicketModal = (ticket: TicketItem) => {
        setViewingTicket(ticket);
        setReplyData({
            reply_message: '',
            status: ticket.status === 'Open' ? 'In Progress' : ticket.status,
        });

        // Mark ticket as read immediately in UI and on server
        if (!ticket.is_read) {
            setTicketList(prev => prev.map(t => t.id === ticket.id ? { ...t, is_read: true } : t));
            router.post(`/admin/vendor-tickets/${ticket.id}/mark-read`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleMarkAllRead = () => {
        setTicketList(prev => prev.map(t => ({ ...t, is_read: true })));
        router.post('/admin/vendor-tickets/mark-all-read', {}, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'সকল টিকেট পঠিত হিসেবে চিহ্নিত করা হয়েছে!',
                    showConfirmButton: false,
                    timer: 2500,
                });
            }
        });
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!viewingTicket || !replyData.reply_message) return;

        postReply(`/admin/vendor-tickets/${viewingTicket.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => {
                resetReply();
                setViewingTicket(null);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'ভেন্ডরকে রিপ্লাই সফলভাবে পাঠানো হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleDeleteTicket = (id: number, ticketNum: string) => {
        Swal.fire({
            title: 'টিকেট মুছে ফেলবেন?',
            text: `আপনি কি নিশ্চিত যে টিকেট ${ticketNum} মুছে ফেলতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, মুছুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#ef4444',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/vendor-tickets/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'টিকেট মুছে ফেলা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                        });
                    }
                });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Open':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> অপেক্ষমাণ (Open)
                    </span>
                );
            case 'In Progress':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                        <Clock className="w-3 h-3 text-indigo-600" /> প্রসেসিং (In Progress)
                    </span>
                );
            case 'Resolved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> সমাধানকৃত (Resolved)
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        <XCircle className="w-3 h-3 text-slate-500" /> {status}
                    </span>
                );
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'Urgent':
            case 'High':
                return <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">{priority}</span>;
            case 'Medium':
                return <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">{priority}</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">{priority}</span>;
        }
    };

    return (
        <>
            <Head title="Vendor Support Tickets — Super Admin" />

            <div className="space-y-6">

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                    Support & Helpdesk
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                                <Headphones className="w-8 h-8 text-indigo-400" />
                                Vendor Support Tickets
                            </h1>
                            <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-2xl">
                                ভেন্ডরদের রিপোর্ট করা সমস্যা, পেমেন্ট ক্যোয়ারী ও সাপোর্ট টিকেটের রিপ্লাই দিন এবং স্ট্যাটাস পরিচালনা করুন।
                            </p>
                        </div>
                    </div>
                </div>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট টিকেট</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{counts.total}</h3>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">অপেক্ষমাণ (Open)</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{counts.open}</h3>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">প্রসেসিং চলছে</p>
                            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{counts.in_progress}</h3>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">সমাধানকৃত (Resolved)</p>
                            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{counts.resolved}</h3>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                        {(['all', 'Open', 'In Progress', 'Resolved'] as const).map(st => {
                            const isActive = (statusFilter || 'all').toLowerCase() === st.toLowerCase();
                            return (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => handleStatusFilterChange(st)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                >
                                    {st === 'all' ? 'সকল টিকেট' : st}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition cursor-pointer whitespace-nowrap shadow-xs"
                            title="সকল নতুন টিকেট পঠিত চিহ্নিত করুন"
                        >
                            <CheckCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>সব পঠিত চিহ্নিত করুন</span>
                        </button>

                        <form onSubmit={handleSearch} className="relative flex-1 sm:w-72 flex items-center">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="টিকেট আইডি, বিষয় বা বিবরণ খুঁজুন..."
                                className="w-full pl-9 pr-20 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition"
                            />
                            <button
                                type="submit"
                                className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                            >
                                খুঁজুন
                            </button>
                        </form>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[11px] font-bold">
                                <tr>
                                    <th className="p-3.5">টিকেট আইডি</th>
                                    <th className="p-3.5">ভেন্ডর / শপ</th>
                                    <th className="p-3.5">বিষয় ও ক্যাটাগরি</th>
                                    <th className="p-3.5">অগ্রাধিকার</th>
                                    <th className="p-3.5">স্ট্যাটাস</th>
                                    <th className="p-3.5">তারিখ</th>
                                    <th className="p-3.5 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {ticketList.length > 0 ? (
                                    ticketList.map(ticket => {
                                        const isUnread = !ticket.is_read;
                                        return (
                                            <tr 
                                                key={ticket.id} 
                                                className={`transition ${
                                                    isUnread 
                                                        ? 'bg-emerald-50/75 dark:bg-emerald-950/25 border-l-4 border-emerald-500 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40' 
                                                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                                                }`}
                                            >
                                                <td className="p-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                    <div className="flex items-center gap-2">
                                                        <span>{ticket.ticket_number}</span>
                                                        {isUnread && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-xs animate-pulse">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                                                                নতুন
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3.5">
                                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <Store className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{ticket.shop?.name || 'Vendor Shop'}</span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                        <User className="w-3 h-3" />
                                                        <span>{ticket.user?.name || 'Seller'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3.5 max-w-xs">
                                                    <div className="font-bold text-slate-900 dark:text-white truncate">
                                                        {ticket.subject}
                                                    </div>
                                                    <span className="inline-block mt-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                                        {ticket.category}
                                                    </span>
                                                </td>
                                                <td className="p-3.5">
                                                    {getPriorityBadge(ticket.priority)}
                                                </td>
                                                <td className="p-3.5">
                                                    {getStatusBadge(ticket.status)}
                                                </td>
                                                <td className="p-3.5 text-slate-400 text-[11px]">
                                                    {new Date(ticket.created_at).toLocaleDateString('bn-BD', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                                                    <button
                                                        onClick={() => openTicketModal(ticket)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition cursor-pointer text-xs"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>ভিউ ও রিপ্লাই</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTicket(ticket.id, ticket.ticket_number)}
                                                        className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                                                        title="টিকেট মুছুন"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-slate-400 font-semibold">
                                            কোনো সাপোর্ট টিকেট পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal: View Ticket & Send Admin Reply */}
            {viewingTicket && (
                <div 
                    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setViewingTicket(null)}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                                        {viewingTicket.ticket_number}
                                    </span>
                                    <span>•</span>
                                    {getPriorityBadge(viewingTicket.priority)}
                                    <span>•</span>
                                    {getStatusBadge(viewingTicket.status)}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                                    {viewingTicket.subject}
                                </h3>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                    <span>ভেন্ডর শপ: <strong>{viewingTicket.shop?.name || 'N/A'}</strong></span>
                                    <span>•</span>
                                    <span>ক্যাটাগরি: <strong>{viewingTicket.category}</strong></span>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingTicket(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Conversation & Details Scroll Area */}
                        <div className="overflow-y-auto flex-1 py-4 space-y-4 text-xs">
                            
                            {/* Initial Problem Description by Seller */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                                    <span>ভেন্ডরের প্রাথমিক বিবরণ (Initial Issue):</span>
                                    <span>{new Date(viewingTicket.created_at).toLocaleDateString('bn-BD')}</span>
                                </div>
                                <p className="text-slate-900 dark:text-slate-100 leading-relaxed font-medium whitespace-pre-wrap">
                                    {viewingTicket.description}
                                </p>
                            </div>

                            {/* Thread / Admin Responses & Follow-ups */}
                            {viewingTicket.admin_reply ? (
                                <div className="space-y-3">
                                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                        কথোপকথনের হিস্ট্রি (Conversation Thread):
                                    </div>
                                    <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-2">
                                        <div className="text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium whitespace-pre-wrap text-xs sm:text-[13px]">
                                            {viewingTicket.admin_reply}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-semibold">
                                    এখনো কোনো রিপ্লাই দেওয়া হয়নি। নিচে ভেন্ডরের জন্য উত্তর লিখুন।
                                </div>
                            )}

                            {/* Super Admin Reply Form */}
                            <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        ভেন্ডরকে রিপ্লাই লিখুন (Write Reply):
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={replyData.reply_message}
                                        onChange={e => setReplyData('reply_message', e.target.value)}
                                        placeholder="ভেন্ডরের মেসেজের উত্তর লিখুন..."
                                        className="w-full text-xs sm:text-[13px] border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 transition leading-relaxed"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">স্ট্যাটাস:</label>
                                        <select
                                            value={replyData.status}
                                            onChange={e => setReplyData('status', e.target.value)}
                                            className="text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved (সমাধান হয়েছে)</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setViewingTicket(null)}
                                            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                                        >
                                            বাতিল
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={replyProcessing}
                                            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>{replyProcessing ? 'পাঠানো হচ্ছে...' : 'ভেন্ডরকে রিপ্লাই পাঠান'}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}
