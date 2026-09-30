import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    AlertTriangle, 
    Plus, 
    Search, 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    HelpCircle, 
    X, 
    Send, 
    Eye, 
    ShieldCheck, 
    FileText, 
    LifeBuoy, 
    AlertCircle,
    Calendar,
    ChevronRight,
    UserCircle,
    Tag,
    Flame
} from 'lucide-react';
import Swal from 'sweetalert2';

interface TicketItem {
    id: number;
    ticket_number: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    description: string;
    admin_reply?: string;
    created_at: string;
}

interface ReportIssueProps {
    tickets?: TicketItem[];
    counts?: {
        total: number;
        open: number;
        in_progress: number;
        resolved: number;
    };
    filters?: {
        status?: string;
        search?: string;
    };
}

export default function ReportIssue({
    tickets = [],
    counts = { total: 0, open: 0, in_progress: 0, resolved: 0 },
    filters = {}
}: ReportIssueProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [activeStatus, setActiveStatus] = useState(filters.status || 'All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingTicket, setViewingTicket] = useState<TicketItem | null>(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, reset: resetCreate } = useForm({
        subject: '',
        category: 'Payment & Payout',
        priority: 'Medium',
        description: '',
    });

    const { data: replyData, setData: setReplyData, post: postReply, processing: replyProcessing, reset: resetReply } = useForm({
        message: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/seller/report-issue', { search, status: activeStatus }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        setActiveStatus(status);
        router.get('/seller/report-issue', { search, status }, { preserveState: true });
    };

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!createData.subject || !createData.description) return;

        postCreate('/seller/report-issue', {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Support ticket submitted! Super Admin will review.',
                    showConfirmButton: false,
                    timer: 3500,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!viewingTicket || !replyData.message) return;

        postReply(`/seller/report-issue/${viewingTicket.id}/reply`, {
            preserveScroll: true,
            onSuccess: () => {
                resetReply();
                setViewingTicket(null);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Follow-up message sent on ticket!',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Open':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Open
                    </span>
                );
            case 'In Progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> In Progress
                    </span>
                );
            case 'Resolved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Resolved
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <>
            <Head title="Support & Issues — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <LifeBuoy className="w-3.5 h-3.5 text-indigo-400" />
                                24/7 Super Admin Support Center
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Support & Issue Reports</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                পেমেন্ট, কুরিয়ার, টেকনিক্যাল সমস্যা অথবা যেকোনো সাহায্যের জন্য সুপার অ্যাডমিনের কাছে টিকেট জমা দিন।
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer shrink-0"
                            >
                                <Plus className="w-4 h-4" /> Create Support Ticket
                            </button>
                        </div>
                    </div>
                </div>

                {/* Support Stat Cards (4 Cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Tickets</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {counts.total}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Open Issues</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {counts.open}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">In Progress</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {counts.in_progress}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Resolved</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {counts.resolved}
                        </h3>
                    </div>

                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                        {['All', 'Open', 'In Progress', 'Resolved'].map(st => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilter(st)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                    activeStatus === st
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                                }`}
                            >
                                {st === 'All' ? 'All Tickets' : st}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative min-w-[260px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input 
                            type="text"
                            placeholder="Search ticket ID or subject..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                        />
                    </form>

                </div>

                {/* Tickets Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <LifeBuoy className="w-5 h-5 text-indigo-600" /> Support Ticket List
                        </h3>
                        <span className="text-xs text-slate-500 font-bold">
                            Total {tickets.length} Tickets
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Ticket ID & Date</th>
                                    <th className="px-6 py-4">Subject & Category</th>
                                    <th className="px-6 py-4 text-center">Priority</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                                            No support tickets found.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((tkt) => (
                                        <tr key={tkt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition">
                                            
                                            {/* ID & Date */}
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block text-sm">
                                                    {tkt.ticket_number}
                                                </span>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" /> {new Date(tkt.created_at).toLocaleDateString()}
                                                </span>
                                            </td>

                                            {/* Subject & Category */}
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                                                    {tkt.subject}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md mt-1">
                                                    <Tag className="w-3 h-3 text-indigo-500" /> {tkt.category}
                                                </span>
                                            </td>

                                            {/* Priority */}
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    tkt.priority === 'Urgent' || tkt.priority === 'High'
                                                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {tkt.priority} Priority
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(tkt.status)}
                                            </td>

                                            {/* Action */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setViewingTicket(tkt)}
                                                    className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl font-bold text-xs transition border border-indigo-200 dark:border-indigo-800 inline-flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Details
                                                </button>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal for Creating New Support Ticket */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-600" /> Create Support Ticket
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Issue Subject *
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Briefly state your issue (e.g. Payout Delay for Order #9024)"
                                    value={createData.subject}
                                    onChange={e => setCreateData('subject', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Category *
                                    </label>
                                    <select
                                        value={createData.category}
                                        onChange={e => setCreateData('category', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="Payment & Payout">Payment & Payout</option>
                                        <option value="Courier & Dispatch">Courier & Dispatch</option>
                                        <option value="Bug / Technical Issue">Bug / Technical Issue</option>
                                        <option value="Product Listing">Product Listing</option>
                                        <option value="General Inquiry">General Inquiry</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Priority Level *
                                    </label>
                                    <select
                                        value={createData.priority}
                                        onChange={e => setCreateData('priority', e.target.value)}
                                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Detailed Description *
                                </label>
                                <textarea 
                                    rows={4}
                                    placeholder="Explain your problem in detail..."
                                    value={createData.description}
                                    onChange={e => setCreateData('description', e.target.value)}
                                    className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    required
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowCreateModal(false)} 
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={createProcessing}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="w-3.5 h-3.5" /> Submit Ticket
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Viewing Ticket Details & Admin Replies */}
            {viewingTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
                        
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <div>
                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs block">
                                    {viewingTicket.ticket_number}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {viewingTicket.subject}
                                </h3>
                            </div>
                            <button onClick={() => setViewingTicket(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
                            
                            {/* Issue Details Box */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Your Description:</span>
                                    {getStatusBadge(viewingTicket.status)}
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                    {viewingTicket.description}
                                </p>
                            </div>

                            {/* Super Admin Response Box */}
                            {viewingTicket.admin_reply && (
                                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 text-xs">
                                        <ShieldCheck className="w-4 h-4 text-indigo-600" /> Super Admin Support Response:
                                    </div>
                                    <div className="text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium whitespace-pre-wrap">
                                        {viewingTicket.admin_reply}
                                    </div>
                                </div>
                            )}

                            {/* Reply Form */}
                            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block">
                                    Send Follow-up Message
                                </label>
                                <textarea 
                                    rows={3}
                                    placeholder="Write a message to Super Admin support..."
                                    value={replyData.message}
                                    onChange={e => setReplyData('message', e.target.value)}
                                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                <div className="flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={replyProcessing}
                                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" /> Send Reply
                                    </button>
                                </div>
                            </form>

                        </div>

                    </div>
                </div>
            )}
        </>
    );
}

ReportIssue.layout = (page: any) => <SellerLayout children={page} />;
