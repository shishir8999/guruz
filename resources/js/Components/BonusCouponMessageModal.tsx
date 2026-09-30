import React, { useState } from 'react';
import { X, Save, RotateCcw, CheckCircle2, Gift, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

export interface BonusCouponMessageData {
    title: string;
    description: string;
    badge?: string;
    icon?: string;
}

interface BonusCouponMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: BonusCouponMessageData;
    onSuccess?: (updated: BonusCouponMessageData) => void;
}

const DEFAULT_MESSAGE: BonusCouponMessageData = {
    title: 'প্রিয় গ্রাহক, আমাদের সাথেই থাকুন!',
    description: 'আপনার জন্য আকর্ষণীয় বোনাস কুপন ও স্পেশাল সারপ্রাইজ অফার খুব শীঘ্রই আসছে। নিয়মিত কেনাকাটায় চোখ রাখুন দারুণ সব ছাড়ে!',
    badge: 'ধামাকা অফার লোড হচ্ছে...',
    icon: '🎁',
};

const SUGGESTED_EMOJIS = ['🎁', '🎉', '🌟', '🏷️', '🛍️', '💝', '🔥'];

export default function BonusCouponMessageModal({
    isOpen,
    onClose,
    initialData,
    onSuccess,
}: BonusCouponMessageModalProps) {
    const [title, setTitle] = useState(initialData?.title || DEFAULT_MESSAGE.title);
    const [description, setDescription] = useState(initialData?.description || DEFAULT_MESSAGE.description);
    const [badge, setBadge] = useState(initialData?.badge || DEFAULT_MESSAGE.badge || '');
    const [icon, setIcon] = useState(initialData?.icon || DEFAULT_MESSAGE.icon || '🎁');
    const [isSaving, setIsSaving] = useState(false);

    // Sync when initialData changes or modal opens
    React.useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || DEFAULT_MESSAGE.title);
            setDescription(initialData.description || DEFAULT_MESSAGE.description);
            setBadge(initialData.badge ?? DEFAULT_MESSAGE.badge ?? '');
            setIcon(initialData.icon || DEFAULT_MESSAGE.icon || '🎁');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleResetDefault = () => {
        setTitle(DEFAULT_MESSAGE.title);
        setDescription(DEFAULT_MESSAGE.description);
        setBadge(DEFAULT_MESSAGE.badge || '');
        setIcon(DEFAULT_MESSAGE.icon || '🎁');
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'তথ্য দিন',
                text: 'শিরোনাম এবং বিস্তারিত বার্তা অবশ্যই পূরণ করতে হবে।',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        setIsSaving(true);
        try {
            const payload: BonusCouponMessageData = {
                title: title.trim(),
                description: description.trim(),
                badge: badge.trim(),
                icon: icon.trim() || '🎁',
            };

            const res = await fetch('/admin/bonus-coupon-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'বোনাস কুপন বার্তা সফলভাবে সংরক্ষিত হয়েছে!',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                });
                if (onSuccess) {
                    onSuccess(payload);
                }
                onClose();
            } else {
                Swal.fire('Error', 'সার্ভারে সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'সার্ভারের সাথে যোগাযোগ করতে ব্যর্থ হয়েছে।', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                            🎁
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                                বোনাস কুপন বার্তা পরিবর্তন করুন
                            </h3>
                            <p className="text-xs text-indigo-100/90 font-medium">
                                কাস্টমার ড্যাশবোর্ডে প্রদর্শিত লেখা এখান থেকে সহজে এডিট করুন
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5">
                    
                    {/* Input 1: Icon / Emoji */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                            আইকন বা ইমোজি
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                            <input
                                type="text"
                                value={icon}
                                onChange={e => setIcon(e.target.value)}
                                maxLength={10}
                                placeholder="🎁"
                                className="w-20 text-center text-xl bg-slate-50 border border-slate-200 rounded-xl py-2 font-bold focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                            />
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {SUGGESTED_EMOJIS.map(em => (
                                    <button
                                        key={em}
                                        type="button"
                                        onClick={() => setIcon(em)}
                                        className={`w-9 h-9 rounded-xl border text-lg flex items-center justify-center transition cursor-pointer ${
                                            icon === em 
                                                ? 'bg-indigo-50 border-indigo-400 scale-105 shadow-2xs' 
                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {em}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Input 2: Title */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                            প্রধান শিরোনাম (Title) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="যেমন: প্রিয় গ্রাহক, আমাদের সাথেই থাকুন!"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                            required
                        />
                    </div>

                    {/* Input 3: Description */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                            বিস্তারিত বার্তা (Description) <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="গ্রাহকের জন্য সুন্দর ও আকর্ষণীয় বিবরণ লিখুন..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition leading-relaxed resize-none"
                            required
                        />
                    </div>

                    {/* Input 4: Badge */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                            নিচের ব্যাজ টেক্সট (Badge Text)
                        </label>
                        <input
                            type="text"
                            value={badge}
                            onChange={e => setBadge(e.target.value)}
                            placeholder="যেমন: ধামাকা অফার লোড হচ্ছে..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition"
                        />
                    </div>

                    {/* Live Preview Box */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black text-slate-600 flex items-center gap-1.5">
                                <Eye className="w-3.5 h-3.5 text-indigo-500" />
                                <span>কাস্টমার ড্যাশবোর্ডে যেমন দেখাবে (লাইভ প্রিভিউ):</span>
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                Live Preview
                            </span>
                        </div>

                        {/* Customer Dashboard Mirror Card */}
                        <div className="text-center py-7 px-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/80 border-2 border-dashed border-indigo-200/90 rounded-2xl relative overflow-hidden shadow-2xs">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center text-xl shadow-md shadow-orange-500/20 mb-3 animate-bounce">
                                {icon || '🎁'}
                            </div>
                            <h4 className="text-sm sm:text-base font-black text-slate-800 mb-1.5 flex items-center justify-center gap-1.5">
                                <span>{title || 'প্রিয় গ্রাহক, আমাদের সাথেই থাকুন!'}</span>
                            </h4>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-md mx-auto leading-relaxed">
                                {description || 'আপনার জন্য আকর্ষণীয় বোনাস কুপন ও স্পেশাল সারপ্রাইজ অফার খুব শীঘ্রই আসছে...'}
                            </p>
                            {badge && (
                                <div className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-indigo-100 text-indigo-700 text-[11px] font-bold shadow-2xs">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                    <span>{badge}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                        <button
                            type="button"
                            onClick={handleResetDefault}
                            className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <RotateCcw size={14} />
                            <span>ডিফল্ট টেক্সট আনুন</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            >
                                বাতিল
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
                            >
                                <Save size={14} />
                                <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}
