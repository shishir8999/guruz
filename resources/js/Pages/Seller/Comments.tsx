import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    MessageSquare, 
    Star, 
    HelpCircle, 
    Send, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    Search, 
    MessageCircle, 
    User, 
    Filter,
    X,
    CornerDownRight
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Reply {
    id: number | string;
    user_name: string;
    reply_text: string;
    created_at: string;
}

interface CommentItem {
    id: string;
    db_id: number;
    type: 'question' | 'review';
    product_name: string;
    product_image?: string | null;
    customer_name: string;
    content: string;
    rating?: number | null;
    is_answered: boolean;
    replies: Reply[];
    date: string;
}

interface CommentsProps {
    comments?: CommentItem[];
    totalComments?: number;
    pendingReplies?: number;
    avgRating?: number;
}

export default function Comments({ 
    comments = [], 
    totalComments = 0, 
    pendingReplies = 0, 
    avgRating = 5.0 
}: CommentsProps) {
    const [itemList, setItemList] = useState<CommentItem[]>(comments);
    const [filterTab, setFilterTab] = useState<'all' | 'unanswered' | 'questions' | 'reviews'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        setItemList(comments);
    }, [comments]);

    const activeComments = itemList;
    const unansweredCount = activeComments.filter(c => !c.is_answered).length;

    const filteredComments = activeComments.filter(c => {
        const matchesTab = filterTab === 'all'
            ? true
            : filterTab === 'unanswered'
                ? !c.is_answered
                : filterTab === 'questions'
                    ? c.type === 'question'
                    : c.type === 'review';

        const matchesSearch = c.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              c.content.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const handleSendReply = (commentId: string) => {
        if (!replyText.trim()) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'Please enter a reply message.',
                showConfirmButton: false,
                timer: 2000
            });
            return;
        }

        const textToSubmit = replyText;

        // Optimistic UI update
        setItemList(prev => prev.map(item => {
            if (item.id === commentId) {
                return {
                    ...item,
                    is_answered: true,
                    replies: [
                        ...item.replies,
                        {
                            id: Date.now(),
                            user_name: 'Shop Owner (You)',
                            reply_text: textToSubmit,
                            created_at: 'Just now'
                        }
                    ]
                };
            }
            return item;
        }));

        setReplyingId(null);
        setReplyText('');

        router.post('/seller/comments/reply', {
            comment_id: commentId,
            reply: textToSubmit,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Reply sent to customer successfully!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleDeleteComment = (id: string, customerName: string) => {
        Swal.fire({
            title: 'Delete Comment?',
            text: `Are you sure you want to delete the comment from ${customerName}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                // Optimistic UI removal
                setItemList(prev => prev.filter(c => c.id !== id));

                router.delete(`/seller/comments/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'info',
                            title: 'Comment removed.',
                            showConfirmButton: false,
                            timer: 2500,
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Product Comments & Customer Reviews — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <MessageCircle className="w-3.5 h-3.5 text-indigo-400" />
                                Customer Engagement Center
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Product Comments & Reviews</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                ক্রেতাদের প্রশ্ন, মন্তব্য ও রিভিউ পর্যালোচনা করুন এবং সরাসরি উত্তর দিন।
                            </p>
                        </div>
                    </div>
                </div>

                {/* Interactive Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div 
                        onClick={() => setFilterTab('all')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            filterTab === 'all' 
                                ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Customer Reviews</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeComments.length}</h3>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5 flex items-center gap-1">
                                Click to view all ({activeComments.length})
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                    </div>

                    <div 
                        onClick={() => setFilterTab('unanswered')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            filterTab === 'unanswered' 
                                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-md' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unanswered Inquiries</p>
                            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{unansweredCount}</h3>
                            <p className="text-[11px] text-amber-600/90 font-bold mt-0.5 flex items-center gap-1">
                                Click to filter unanswered ({unansweredCount})
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    <div 
                        onClick={() => setFilterTab('reviews')}
                        className={`border rounded-2xl p-5 shadow-xs flex items-center justify-between cursor-pointer transition duration-200 ${
                            filterTab === 'reviews' 
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                        }`}
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Shop Rating</p>
                            <div className="flex items-center gap-2 mt-1">
                                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{avgRating}</h3>
                                <div className="flex items-center text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-[11px] text-emerald-600/90 font-bold mt-0.5 flex items-center gap-1">
                                Click to view reviews ({activeComments.filter(c => c.type === 'review').length})
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {[
                            { id: 'all', label: 'All Comments', count: activeComments.length },
                            { id: 'unanswered', label: 'Unanswered', count: unansweredCount },
                            { id: 'questions', label: 'Q & A', count: activeComments.filter(c => c.type === 'question').length },
                            { id: 'reviews', label: 'Reviews', count: activeComments.filter(c => c.type === 'review').length },
                        ].map(tab => {
                            const isActive = filterTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterTab(tab.id as any)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer flex items-center gap-1.5 ${
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
                            placeholder="Search product, buyer, comment..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                    {filteredComments.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                            <MessageCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                            <p className="text-xs font-semibold">No comments or reviews found matching your search.</p>
                        </div>
                    ) : (
                        filteredComments.map(item => (
                            <div 
                                key={item.id} 
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition space-y-4"
                            >
                                {/* Top Product Badge & Status Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-500 overflow-hidden shrink-0">
                                            {item.product_image ? (
                                                <img src={item.product_image.startsWith('http') ? item.product_image : `/storage/${item.product_image}`} alt={item.product_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <MessageSquare className="w-5 h-5 text-indigo-500" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{item.product_name}</h4>
                                            <span className="text-[10px] text-slate-400 font-medium">Product Item Inquiry</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.type === 'review' ? (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current text-emerald-500" /> Review ({item.rating}⭐)
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                                <HelpCircle className="w-3 h-3 text-blue-500" /> Customer Question
                                            </span>
                                        )}

                                        {item.is_answered ? (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Replied
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} /> Pending Reply
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Question / Review Body */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                                                <User className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{item.customer_name}</span>
                                        </div>
                                        <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                                    </div>

                                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium pl-8 leading-relaxed">
                                        "{item.content}"
                                    </p>
                                </div>

                                {/* Existing Replies Thread */}
                                {item.replies && item.replies.length > 0 && (
                                    <div className="pl-6 space-y-2 border-l-2 border-indigo-200 dark:border-indigo-900 mt-3">
                                        {item.replies.map((rep, rIdx) => (
                                            <div key={rep.id || rIdx} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
                                                <div className="flex items-center justify-between text-slate-500 font-medium">
                                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                                        <CornerDownRight className="w-3 h-3" /> {rep.user_name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">{rep.created_at}</span>
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 font-medium pl-4">{rep.reply_text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Inline Reply Box & Action Buttons */}
                                <div className="pt-2 flex items-center justify-between gap-3">
                                    {replyingId === item.id ? (
                                        <div className="w-full flex items-center gap-2 animate-in fade-in duration-150">
                                            <input
                                                type="text"
                                                placeholder={`Type your reply to ${item.customer_name}...`}
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendReply(item.id)}
                                                className="flex-1 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSendReply(item.id)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" /> Send
                                            </button>
                                            <button
                                                onClick={() => setReplyingId(null)}
                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full flex items-center justify-between">
                                            <button
                                                onClick={() => { setReplyingId(item.id); setReplyText(''); }}
                                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                                Reply to Customer
                                            </button>

                                            <button
                                                onClick={() => handleDeleteComment(item.id, item.customer_name)}
                                                className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                                title="Delete comment"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </>
    );
}

Comments.layout = (page: any) => <SellerLayout children={page} />;
