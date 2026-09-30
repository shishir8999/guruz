import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Bell, 
    AlertTriangle, 
    Wrench, 
    ShieldCheck, 
    Info, 
    Calendar, 
    Search, 
    CheckCircle2, 
    ChevronRight, 
    Eye, 
    X,
    Megaphone,
    ShieldAlert
} from 'lucide-react';

interface NoticeItem {
    id: number;
    title: string;
    body: string;
    content: string;
    type: 'Urgent' | 'Maintenance' | 'Policy' | 'General';
    status: string;
    date: string;
    raw_date: string;
}

interface NoticeProps {
    notices?: NoticeItem[];
}

export default function Notice({ notices = [] }: NoticeProps) {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
    const [readNoticeIds, setReadNoticeIds] = useState<number[]>([]);

    const filteredNotices = notices.filter(n => {
        const matchesFilter = activeFilter === 'all'
            ? true
            : activeFilter === 'urgent'
                ? n.type.toLowerCase() === 'urgent'
                : activeFilter === 'maintenance'
                    ? n.type.toLowerCase() === 'maintenance'
                    : n.type.toLowerCase() === 'policy' || n.type.toLowerCase() === 'general';

        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              n.body.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const urgentCount = notices.filter(n => n.type.toLowerCase() === 'urgent').length;
    const maintenanceCount = notices.filter(n => n.type.toLowerCase() === 'maintenance').length;

    const toggleMarkAsRead = (id: number) => {
        setReadNoticeIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getTypeStyle = (type: string) => {
        switch (type.toLowerCase()) {
            case 'urgent':
                return {
                    badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                    icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
                    gradient: 'from-rose-500/10 via-transparent to-transparent',
                    border: 'hover:border-rose-300 dark:hover:border-rose-800'
                };
            case 'maintenance':
                return {
                    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                    icon: <Wrench className="w-4 h-4 text-amber-500" />,
                    gradient: 'from-amber-500/10 via-transparent to-transparent',
                    border: 'hover:border-amber-300 dark:hover:border-amber-800'
                };
            case 'policy':
                return {
                    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
                    icon: <ShieldCheck className="w-4 h-4 text-indigo-500" />,
                    gradient: 'from-indigo-500/10 via-transparent to-transparent',
                    border: 'hover:border-indigo-300 dark:hover:border-indigo-800'
                };
            default:
                return {
                    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                    icon: <Info className="w-4 h-4 text-emerald-500" />,
                    gradient: 'from-emerald-500/10 via-transparent to-transparent',
                    border: 'hover:border-emerald-300 dark:hover:border-emerald-800'
                };
        }
    };

    return (
        <>
            <Head title="Official Super Admin Notice Board — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                                <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
                                Official Platform Announcements
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
                                Super Admin Notice Board
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
                                সুপার অ্যাডমিন কর্তৃক প্রকাশিত সকল অফিশিয়াল নোটিশ, নিয়মাবলী ও প্ল্যাটফর্মের আপডেট সমূহ এখান থেকে সরাসরি দেখতে পারবেন।
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div 
                        onClick={() => setActiveFilter('all')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            activeFilter === 'all'
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Notices</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{notices.length}</h3>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">Click to view all notices</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Bell className="w-6 h-6" />
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveFilter('urgent')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            activeFilter === 'urgent'
                                ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Urgent Alerts</p>
                            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{urgentCount}</h3>
                            <p className="text-[11px] text-rose-600/90 font-bold mt-0.5">Important high priority notices</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                    </div>

                    <div 
                        onClick={() => setActiveFilter('maintenance')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            activeFilter === 'maintenance'
                                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Maintenance</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{maintenanceCount}</h3>
                            <p className="text-[11px] text-amber-600/90 font-bold mt-0.5">Platform service updates</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Wrench className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        {[
                            { id: 'all', label: 'All Notices', count: notices.length },
                            { id: 'urgent', label: 'Urgent Alerts', count: urgentCount },
                            { id: 'maintenance', label: 'Maintenance', count: maintenanceCount },
                            { id: 'policy', label: 'Policy & Rules', count: notices.filter(n => n.type.toLowerCase() === 'policy').length },
                        ].map(tab => {
                            const isActive = activeFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveFilter(tab.id)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search notices by keyword..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Notices List */}
                <div className="space-y-4">
                    {filteredNotices.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                            <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                            <p className="text-xs font-semibold">No official notices match your search criteria.</p>
                        </div>
                    ) : (
                        filteredNotices.map(notice => {
                            const typeStyle = getTypeStyle(notice.type);
                            const isRead = readNoticeIds.includes(notice.id);

                            return (
                                <div
                                    key={notice.id}
                                    className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition duration-200 space-y-4 relative overflow-hidden ${typeStyle.border} ${isRead ? 'opacity-75' : ''}`}
                                >
                                    <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${typeStyle.gradient}`} />

                                    {/* Header Info */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${typeStyle.badgeBg}`}>
                                                {typeStyle.icon}
                                                {notice.type} Notice
                                            </span>

                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3 text-indigo-500" /> Super Admin Official
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {notice.date}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notice Title & Body */}
                                    <div className="space-y-2">
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                                            {notice.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                            {notice.body}
                                        </p>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="pt-2 flex items-center justify-between gap-4">
                                        <button
                                            onClick={() => setSelectedNotice(notice)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Read Full Announcement
                                        </button>

                                        <button
                                            onClick={() => toggleMarkAsRead(notice.id)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                                                isRead 
                                                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800' 
                                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            {isRead ? 'Marked as Read' : 'Mark as Read'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modal Popup for Full Notice Details */}
                {selectedNotice && (
                    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setSelectedNotice(null)}
                                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="space-y-3 pr-8">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getTypeStyle(selectedNotice.type).badgeBg}`}>
                                    {getTypeStyle(selectedNotice.type).icon}
                                    {selectedNotice.type} Official Notice
                                </span>

                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                                    {selectedNotice.title}
                                </h2>

                                <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> Published: {selectedNotice.date}
                                </p>
                            </div>

                            <div className="border-t border-b border-slate-100 dark:border-slate-800 py-6 text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                                {selectedNotice.content}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                                    Issued by Super Admin Team
                                </div>

                                <button
                                    onClick={() => setSelectedNotice(null)}
                                    className="bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
                                >
                                    Close Notice
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}

Notice.layout = (page: any) => <SellerLayout children={page} />;
