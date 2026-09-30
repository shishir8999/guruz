import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Star, MessageSquare, ThumbsUp, MoreVertical, Edit, Trash2, ShieldCheck, Clock, CheckCircle2, X, Send, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    slug?: string;
    primary_image_url?: string;
}

interface Review {
    id: number;
    product_id: number;
    rating: number;
    comment: string;
    is_verified?: boolean;
    created_at: string;
    product?: Product;
}

interface PendingItem {
    id: number;
    product_id: number;
    order_id?: number | string;
    created_at?: string;
    product?: Product;
}

interface ReviewsProps {
    publishedReviews?: Review[];
    toBeReviewed?: PendingItem[];
}

export default function Reviews({ publishedReviews = [], toBeReviewed = [] }: ReviewsProps) {
    const [activeTab, setActiveTab] = useState<'published' | 'pending'>('published');
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

    // Modal state for writing/editing review
    const [modalOpen, setModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [targetProduct, setTargetProduct] = useState<Product | null>(null);
    const [targetOrderId, setTargetOrderId] = useState<number | string | null>(null);

    // Form inputs
    const [rating, setRating] = useState<number>(5);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Local state for helpful counts
    const [helpfulCounts, setHelpfulCounts] = useState<{ [key: number]: number }>({});
    const [helpfulClicked, setHelpfulClicked] = useState<{ [key: number]: boolean }>({});

    // Open Write Review Modal for pending product
    const handleOpenWriteModal = (item: PendingItem) => {
        setEditingReview(null);
        setTargetProduct(item.product || { id: item.product_id, name: 'প্রোডাক্ট' });
        setTargetOrderId(item.order_id || null);
        setRating(5);
        setComment('');
        setModalOpen(true);
    };

    // Open Edit Review Modal for existing review
    const handleOpenEditModal = (review: Review) => {
        setActiveMenuId(null);
        setEditingReview(review);
        setTargetProduct(review.product || { id: review.product_id, name: 'প্রোডাক্ট' });
        setRating(review.rating);
        setComment(review.comment);
        setModalOpen(true);
    };

    // Handle Delete Review
    const handleDeleteReview = (id: number) => {
        setActiveMenuId(null);
        Swal.fire({
            title: 'রিভিউটি মুছে ফেলতে চান?',
            text: 'আপনি কি নিশ্চিত যে এই রিভিউটি ডিলিট করতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/account/reviews/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'রিভিউটি সফলভাবে মুছে ফেলা হয়েছে',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                });
            }
        });
    };

    // Handle Form Submit (Store or Update)
    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'কমেন্ট লিখুন!',
                text: 'অনুগ্রহ করে প্রোডাক্টটি সম্পর্কে আপনার মতামত লিখুন।',
                confirmButtonColor: '#4f46e5'
            });
            return;
        }

        setSubmitting(true);

        if (editingReview) {
            // Update existing review
            router.put(`/account/reviews/${editingReview.id}`, {
                rating,
                comment,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    setSubmitting(false);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'রিভিউ আপডেট করা হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000
                    });
                },
                onError: () => setSubmitting(false)
            });
        } else if (targetProduct) {
            // Store new review
            router.post('/account/reviews', {
                product_id: targetProduct.id,
                order_id: targetOrderId,
                rating,
                comment,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setModalOpen(false);
                    setSubmitting(false);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'আপনার রিভিউ প্রকাশ করা হয়েছে! 🎉',
                        showConfirmButton: false,
                        timer: 3000
                    });
                },
                onError: () => setSubmitting(false)
            });
        }
    };

    // Handle Helpful click
    const handleToggleHelpful = (reviewId: number) => {
        const isClicked = helpfulClicked[reviewId];
        const currentCount = helpfulCounts[reviewId] ?? 0;
        if (isClicked) {
            setHelpfulClicked(prev => ({ ...prev, [reviewId]: false }));
            setHelpfulCounts(prev => ({ ...prev, [reviewId]: Math.max(0, currentCount - 1) }));
        } else {
            setHelpfulClicked(prev => ({ ...prev, [reviewId]: true }));
            setHelpfulCounts(prev => ({ ...prev, [reviewId]: currentCount + 1 }));
        }
    };

    const renderStars = (currentRating: number, interactive = false) => {
        return (
            <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = interactive 
                        ? star <= (hoverRating || rating)
                        : star <= currentRating;

                    return (
                        <button
                            key={star}
                            type={interactive ? "button" : "button"}
                            disabled={!interactive}
                            onClick={() => interactive && setRating(star)}
                            onMouseEnter={() => interactive && setHoverRating(star)}
                            onMouseLeave={() => interactive && setHoverRating(0)}
                            className={`${interactive ? 'cursor-pointer hover:scale-125 transition-transform p-0.5' : 'cursor-default'}`}
                        >
                            <Star
                                size={interactive ? 24 : 16}
                                className={`transition-colors ${
                                    isFilled 
                                        ? 'fill-amber-400 text-amber-400' 
                                        : 'fill-slate-100 text-slate-300'
                                }`}
                            />
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Head title="My Reviews" />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[500px]">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner">
                        <MessageSquare size={24} className="fill-indigo-500/20" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">My Reviews</h1>
                        <p className="text-sm text-slate-500">আপনার প্রোডাক্টের রিভিউ ম্যানেজ করুন এবং নতুন কেনাকাটায় রেটিং দিন।</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-slate-100 mb-8">
                    <button 
                        onClick={() => setActiveTab('published')}
                        className={`pb-4 text-sm font-semibold transition-all duration-300 relative flex items-center gap-2 ${activeTab === 'published' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <CheckCircle2 size={18} className={activeTab === 'published' ? 'text-indigo-600' : 'text-slate-400'} />
                        Published Reviews ({publishedReviews.length})
                        {activeTab === 'published' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full shadow-[0_-2px_10px_rgba(79,70,229,0.5)]"></span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`pb-4 text-sm font-semibold transition-all duration-300 relative flex items-center gap-2 ${activeTab === 'pending' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Clock size={18} className={activeTab === 'pending' ? 'text-indigo-600' : 'text-slate-400'} />
                        To Be Reviewed 
                        <span className={`ml-1 py-0.5 px-2 rounded-full text-xs transition-colors font-bold ${activeTab === 'pending' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                            {toBeReviewed.length}
                        </span>
                        {activeTab === 'pending' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full shadow-[0_-2px_10px_rgba(79,70,229,0.5)]"></span>
                        )}
                    </button>
                </div>

                {/* PUBLISHED REVIEWS TAB */}
                {activeTab === 'published' ? (
                    publishedReviews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
                            <div className="w-24 h-24 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">এখনও কোনো রিভিউ প্রকাশ করেননি!</h3>
                            <p className="text-slate-500 text-sm mb-6">আপনার ক্রয়কৃত প্রোডাক্টের রিভিউ দিয়ে অন্যান্য কাস্টমারদের সাহায্য করুন।</p>
                            <button 
                                onClick={() => setActiveTab('pending')}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition"
                            >
                                রিভিউ লিখুন
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {publishedReviews.map((review) => {
                                const prod = review.product;
                                const img = prod?.primary_image_url || '/storage/products/default.png';

                                return (
                                    <div key={review.id} className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 relative overflow-hidden">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="w-24 h-24 bg-slate-50 rounded-xl border border-slate-100 p-2 overflow-hidden shrink-0 flex items-center justify-center relative">
                                                <img 
                                                    src={img} 
                                                    alt={prod?.name || 'Product'} 
                                                    className="max-w-full max-h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="pr-12">
                                                        <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                            {prod?.name || 'Product'}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-2">
                                                            {renderStars(review.rating)}
                                                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 font-medium">
                                                                <ShieldCheck size={14} />
                                                                Verified Purchase
                                                            </div>
                                                            <span className="text-sm text-slate-400 font-medium">
                                                                {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Action Menu (3 Dots) */}
                                                    <div className="relative shrink-0">
                                                        <button 
                                                            onClick={() => setActiveMenuId(activeMenuId === review.id ? null : review.id)}
                                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                                                            title="Options"
                                                        >
                                                            <MoreVertical size={20} />
                                                        </button>

                                                        {activeMenuId === review.id && (
                                                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-200">
                                                                <button 
                                                                    onClick={() => handleOpenEditModal(review)}
                                                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Edit size={14} /> Edit Review
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteReview(review.id)}
                                                                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Trash2 size={14} /> Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100/80">
                                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{review.comment}</p>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleToggleHelpful(review.id)}
                                                        className={`flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border text-xs font-bold ${
                                                            helpfulClicked[review.id]
                                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                                                        }`}
                                                    >
                                                        <ThumbsUp size={14} className={helpfulClicked[review.id] ? "fill-indigo-600 text-indigo-600" : ""} />
                                                        <span>Helpful ({helpfulCounts[review.id] ?? 0})</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    /* TO BE REVIEWED TAB */
                    toBeReviewed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">কোনো পেন্ডিং রিভিউ নেই!</h3>
                            <p className="text-slate-500 text-sm mb-6">আপনার পূর্বের সব ডেলিভারিকৃত অর্ডারের রিভিউ দেওয়া সম্পন্ন হয়েছে।</p>
                            <Link 
                                href="/products" 
                                className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20"
                            >
                                আরও কেনাকাটা করুন
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {toBeReviewed.map((item) => {
                                const prod = item.product;
                                const img = prod?.primary_image_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500';

                                return (
                                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                        <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-100 p-2 overflow-hidden shrink-0 flex items-center justify-center">
                                            <img 
                                                src={img} 
                                                alt={prod?.name || 'Product'} 
                                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                                            />
                                        </div>
                                        <div className="flex-1 w-full">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    #{item.order_id || 'ORDER'}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {item.created_at || 'Delivered'}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 mb-4 group-hover:text-indigo-600 transition-colors">
                                                {prod?.name || 'Product'}
                                            </h3>
                                            <button 
                                                onClick={() => handleOpenWriteModal(item)}
                                                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-indigo-600/20 active:scale-95"
                                            >
                                                <Star size={16} className="fill-white" />
                                                Write a Review
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}
            </div>

            {/* WRITE / EDIT REVIEW MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button 
                            onClick={() => setModalOpen(false)}
                            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                                <Star size={20} className="fill-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingReview ? 'রিভিউ এডিট করুন' : 'রিভিউ লিখুন'}
                                </h3>
                                <p className="text-xs text-slate-500 truncate max-w-[280px]">
                                    {targetProduct?.name}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            {/* Rating Selector */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                                    আপনার রেটিং সিলেক্ট করুন *
                                </label>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-2">
                                    {renderStars(rating, true)}
                                    <span className="text-xs font-bold text-amber-600 mt-1">
                                        {rating === 5 && '🌟 অসাধারণ (5/5)'}
                                        {rating === 4 && '👍 দারুণ (4/5)'}
                                        {rating === 3 && '🙂 ভালো (3/5)'}
                                        {rating === 2 && '😐 মোটামুটি (2/5)'}
                                        {rating === 1 && '😞 খারাপ (1/5)'}
                                    </span>
                                </div>
                            </div>

                            {/* Comment Field */}
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-2">
                                    আপনার মন্তব্য / মতামত *
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    required
                                    placeholder="প্রোডাক্টের মান, বিল্ড কোয়ালিটি এবং আপনার অভিজ্ঞতা কেমন ছিল লিখুন..."
                                    className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all focus:outline-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Send size={16} />
                                    {submitting ? 'সাবমিট হচ্ছে...' : (editingReview ? 'আপডেট করুন' : 'রিভিউ পোস্ট করুন')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
