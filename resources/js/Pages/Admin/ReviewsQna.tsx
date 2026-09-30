import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MessageSquare, Search, Star, CheckCircle2, XCircle, Send, Inbox } from 'lucide-react';

interface ReviewItem {
    id: number;
    type: 'Review' | 'Q&A';
    rating: number;
    date: string;
    product_name: string;
    comment: string;
    user_name: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    seller_reply?: string;
}

export default function ReviewsQna({ initialReviews }: { initialReviews: ReviewItem[] }) {
    const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews || []);

    const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(reviews[0]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Reviews' | 'Pending' | 'Q&A'>('All');

    const [replyText, setReplyText] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.product_name.toLowerCase().includes(search.toLowerCase()) || r.comment.toLowerCase().includes(search.toLowerCase());
        if (filterType === 'Reviews') return matchesSearch && r.type === 'Review';
        if (filterType === 'Pending') return matchesSearch && r.status === 'Pending';
        if (filterType === 'Q&A') return matchesSearch && r.type === 'Q&A';
        return matchesSearch;
    });

    React.useEffect(() => {
        setReviews(initialReviews || []);
        if (initialReviews?.length > 0 && !selectedReview) {
            setSelectedReview(initialReviews[0]);
        }
    }, [initialReviews]);

    const handleApprove = (id: number) => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
        if (selectedReview?.id === id) {
            setSelectedReview(prev => prev ? { ...prev, status: 'Approved' } : null);
        }
        router.post(`/admin/reviews/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMsg('Review approved and published on storefront!');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        });
    };

    const handleReject = (id: number) => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
        if (selectedReview?.id === id) {
            setSelectedReview(prev => prev ? { ...prev, status: 'Rejected' } : null);
        }
        router.post(`/admin/reviews/${id}/reject`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMsg('Review rejected.');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        });
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText || !selectedReview) return;

        router.post(`/admin/reviews/${selectedReview.id}/reply`, { reply: replyText }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedReview({ ...selectedReview, seller_reply: replyText });
                setReplyText('');
                setSuccessMsg('Reply sent to customer!');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        });
    };

    return (
        <>

            <Head title="Product Reviews & Q&A — Admin Panel" />

            <div className="space-y-6">

                {/* Header Title + Subtitle matching screenshot #5 */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-purple-600" /> Product Reviews & Q&A
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                        Inbox for product reviews, questions, and seller answers.
                    </p>
                </div>

                {/* Alert Notification */}
                {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {successMsg}
                    </div>
                )}

                {/* 2-Column Inbox Layout matching screenshot #5 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">

                    {/* Left Column: Reviews & Q&A Inbox List */}
                    <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                            
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search product or text..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            </div>

                            {/* Filter Pills matching screenshot #5 */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    onClick={() => setFilterType('All')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${filterType === 'All' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                    All ({reviews.length})
                                </button>
                                <button
                                    onClick={() => setFilterType('Reviews')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${filterType === 'Reviews' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                    Reviews ({reviews.filter(r => r.type === 'Review').length})
                                </button>
                                <button
                                    onClick={() => setFilterType('Pending')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${filterType === 'Pending' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                    Pending ({reviews.filter(r => r.status === 'Pending').length})
                                </button>
                                <button
                                    onClick={() => setFilterType('Q&A')}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${filterType === 'Q&A' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                    Q&A (0)
                                </button>
                            </div>

                            {/* Inbox Items List matching screenshot #5 */}
                            <div className="space-y-2 pt-1 max-h-[380px] overflow-y-auto">
                                {filteredReviews.map(r => {
                                    const isSelected = selectedReview?.id === r.id;
                                    return (
                                        <div
                                            key={r.id}
                                            onClick={() => setSelectedReview(r)}
                                            className={`p-3.5 rounded-xl border transition cursor-pointer space-y-1.5 ${
                                                isSelected
                                                    ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800'
                                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="font-bold text-amber-500 flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Review · {r.rating}★
                                                </span>
                                                <span className="font-mono text-slate-400">{r.date}</span>
                                            </div>

                                            <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{r.product_name}</h4>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{r.comment}</p>

                                            <div className="pt-1 flex items-center justify-between">
                                                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded font-bold">
                                                    {r.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>

                    {/* Right Column: Review Details & Reply Card matching screenshot #5 */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                        {!selectedReview ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                                <Inbox className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                                <p className="text-xs font-bold">Select an item to view details</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-1 text-amber-400 text-sm mb-1">
                                            {[...Array(selectedReview.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-amber-400" />
                                            ))}
                                        </div>
                                        <h2 className="text-base font-black text-slate-900 dark:text-white">{selectedReview.product_name}</h2>
                                        <p className="text-xs text-slate-500 font-semibold mt-0.5">By {selectedReview.user_name} on {selectedReview.date}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(selectedReview.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedReview.id)}
                                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl space-y-2">
                                    <h4 className="text-xs font-black uppercase text-slate-400">Customer Review</h4>
                                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                        "{selectedReview.comment}"
                                    </p>
                                </div>

                                {selectedReview.seller_reply && (
                                    <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 p-4 rounded-xl space-y-1">
                                        <h4 className="text-xs font-black uppercase text-purple-700 dark:text-purple-300">Seller Reply</h4>
                                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                                            {selectedReview.seller_reply}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSendReply} className="space-y-3 pt-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Reply to {selectedReview.user_name}
                                    </label>
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Type your official seller response..."
                                        rows={3}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ml-auto"
                                    >
                                        <Send className="w-3.5 h-3.5" /> Send Reply
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        
</>
    );
}
