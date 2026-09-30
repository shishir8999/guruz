import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    ShieldAlert, Search, Filter, Eye, CheckCircle2, 
    XCircle, Clock, ExternalLink, Video, Trash2, Edit,
    CheckCheck, Link as LinkIcon, Info
} from 'lucide-react';

interface WarrantyClaimItem {
    id: number;
    claim_number: string;
    customer_name: string;
    mobile_number: string;
    email: string | null;
    order_id: string | null;
    product_name: string;
    brand_name: string | null;
    product_model: string | null;
    purchase_date: string | null;
    issue_category: string;
    problem_details: string;
    video_path: string | null;
    google_drive_link: string | null;
    status: 'pending' | 'under_review' | 'approved' | 'rejected';
    admin_notes: string | null;
    admin_seen_at?: string | null;
    is_unseen?: boolean;
    created_at: string;
}

interface Props {
    claims: {
        data: WarrantyClaimItem[];
        links: any[];
    };
    unseenCount?: number;
}

export default function WarrantyClaimsPage({ claims, unseenCount = 0 }: Props) {
    const [claimsList, setClaimsList] = useState<WarrantyClaimItem[]>(claims.data || []);
    const [selectedClaim, setSelectedClaim] = useState<WarrantyClaimItem | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [previewMedia, setPreviewMedia] = useState<{ type: 'video' | 'drive'; url: string; originalUrl?: string; title: string } | null>(null);

    useEffect(() => {
        setClaimsList(claims.data || []);
    }, [claims.data]);

    const getDrivePreviewUrl = (url: string) => {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
        return url;
    };

    const { data, setData, put, processing } = useForm({
        status: '',
        admin_notes: '',
        google_drive_link: '',
    });

    const markAsSeen = (claim: WarrantyClaimItem) => {
        if (!claim.is_unseen) return;

        // Immediate optimistic update
        setClaimsList(prev => prev.map(c => c.id === claim.id ? { ...c, is_unseen: false } : c));

        // Instantly update localStorage admin nav counts so sidebar badge goes down in 0ms
        try {
            const cached = localStorage.getItem('guruz_admin_nav_counts');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.pending_warranty_claims && parsed.pending_warranty_claims > 0) {
                    parsed.pending_warranty_claims = Math.max(0, parsed.pending_warranty_claims - 1);
                    localStorage.setItem('guruz_admin_nav_counts', JSON.stringify(parsed));
                    window.dispatchEvent(new CustomEvent('guruz_nav_counts_updated', { detail: parsed }));
                }
            }
        } catch (e) {}

        // Notify server
        fetch(`/admin/warranty-claims/${claim.id}/mark-seen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
        }).catch(() => {});
    };

    const markAllAsSeen = () => {
        setClaimsList(prev => prev.map(c => ({ ...c, is_unseen: false })));

        try {
            const cached = localStorage.getItem('guruz_admin_nav_counts');
            if (cached) {
                const parsed = JSON.parse(cached);
                parsed.pending_warranty_claims = 0;
                localStorage.setItem('guruz_admin_nav_counts', JSON.stringify(parsed));
                window.dispatchEvent(new CustomEvent('guruz_nav_counts_updated', { detail: parsed }));
            }
        } catch (e) {}

        router.post('/admin/warranty-claims/mark-all-seen', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const openEditModal = (claim: WarrantyClaimItem) => {
        markAsSeen(claim);
        setSelectedClaim(claim);
        setData({
            status: claim.status,
            admin_notes: claim.admin_notes || '',
            google_drive_link: claim.google_drive_link || '',
        });
    };

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClaim) return;

        put(`/admin/warranty-claims/${selectedClaim.id}`, {
            onSuccess: () => {
                setSelectedClaim(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('আপনি কি নিশ্চিত যে এই ক্লেইমটি মুছে ফেলতে চান?')) {
            router.delete(`/admin/warranty-claims/${id}`);
        }
    };

    const hasUnseen = claimsList.some(c => c.is_unseen) || unseenCount > 0;

    const filteredClaims = claimsList.filter(item => {
        const matchesSearch = item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.mobile_number.includes(searchTerm) ||
            item.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> অনুমোদিত</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> বাতিল</span>;
            case 'under_review':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> রিভিউ চলছে</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> অপেক্ষমাণ</span>;
        }
    };

    return (
        <>
            <Head title="Warranty Claims Management — Admin Portal" />

            <div className="p-6 space-y-6">
                
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <ShieldAlert className="w-7 h-7 text-blue-600" />
                            Warranty Claims Center
                        </h1>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            গ্রাহকদের ক্লেইমকৃত ওয়ারেন্টির আবেদনসমূহ যাচাই ও স্ট্যাটাস আপডেট করুন
                        </p>
                    </div>

                    {hasUnseen && (
                        <button
                            type="button"
                            onClick={markAllAsSeen}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                            <CheckCheck className="w-4 h-4" />
                            সব পঠিত চিহ্নিত করুন
                        </button>
                    )}
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                            type="text"
                            placeholder="নাম, ফোন, ক্লেইম নম্বর বা প্রোডাক্ট..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 transition"
                        >
                            <option value="all">সকল স্ট্যাটাস</option>
                            <option value="pending">অপেক্ষমাণ (Pending)</option>
                            <option value="under_review">রিভিউ চলছে (Under Review)</option>
                            <option value="approved">অনুমোদিত (Approved)</option>
                            <option value="rejected">বাতিল (Rejected)</option>
                        </select>
                    </div>
                </div>

                {/* Claims Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-semibold text-slate-700">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
                                <tr>
                                    <th className="p-3.5">ক্লেইম নম্বর</th>
                                    <th className="p-3.5">গ্রাহকের নাম ও ফোন</th>
                                    <th className="p-3.5">প্রোডাক্ট ও ব্র্যান্ড</th>
                                    <th className="p-3.5">সমস্যার ধরন</th>
                                    <th className="p-3.5">ভিডিও প্রমাণ</th>
                                    <th className="p-3.5">স্ট্যাটাস</th>
                                    <th className="p-3.5 text-right">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredClaims.length > 0 ? (
                                    filteredClaims.map(claim => (
                                        <tr 
                                            key={claim.id} 
                                            className={`transition ${
                                                claim.is_unseen 
                                                    ? 'bg-emerald-50/70 hover:bg-emerald-100/60 border-l-4 border-l-emerald-500' 
                                                    : 'hover:bg-slate-50/80'
                                            }`}
                                        >
                                            <td className="p-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-blue-600">{claim.claim_number}</span>
                                                    {claim.is_unseen && (
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white animate-pulse">
                                                            নতুন
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <div className="font-bold text-slate-900">{claim.customer_name}</div>
                                                <div className="text-[11px] text-slate-500">{claim.mobile_number}</div>
                                            </td>
                                            <td className="p-3.5">
                                                <div className="font-bold text-slate-800">{claim.product_name}</div>
                                                <div className="text-[11px] text-slate-400">{claim.brand_name || 'N/A'} {claim.product_model ? `(${claim.product_model})` : ''}</div>
                                            </td>
                                            <td className="p-3.5 font-semibold text-amber-800">{claim.issue_category}</td>
                                            <td className="p-3.5">
                                                {claim.video_path ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            markAsSeen(claim);
                                                            setPreviewMedia({ type: 'video', url: claim.video_path!, title: claim.claim_number });
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition cursor-pointer text-xs"
                                                    >
                                                        <Video className="w-3.5 h-3.5" /> ভিডিও প্লে
                                                    </button>
                                                ) : claim.google_drive_link ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            markAsSeen(claim);
                                                            setPreviewMedia({
                                                                type: 'drive',
                                                                url: getDrivePreviewUrl(claim.google_drive_link!),
                                                                originalUrl: claim.google_drive_link!,
                                                                title: claim.claim_number,
                                                            });
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition cursor-pointer text-xs"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" /> ড্রাইভ লিংক
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400">নাই</span>
                                                )}
                                            </td>
                                            <td className="p-3.5">{getStatusBadge(claim.status)}</td>
                                            <td className="p-3.5 text-right space-x-1">
                                                <button
                                                    onClick={() => openEditModal(claim)}
                                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                                    title="ভিউ ও এডিট"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(claim.id)}
                                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                                    title="মুছুন"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">
                                            কোনো ওয়ারেন্টি ক্লেইম পাওয়া যায়নি।
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Modal */}
                {selectedClaim && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div>
                                    <h3 className="text-base font-black text-slate-900">ক্লেইম ডিটেইলস ও স্ট্যাটাস</h3>
                                    <p className="text-xs font-bold text-blue-600">{selectedClaim.claim_number}</p>
                                </div>
                                <button onClick={() => setSelectedClaim(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">✕</button>
                            </div>

                            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border">
                                <p><strong>গ্রাহক:</strong> {selectedClaim.customer_name} ({selectedClaim.mobile_number})</p>
                                <p><strong>প্রোডাক্ট:</strong> {selectedClaim.product_name}</p>
                                <p><strong>সমস্যা:</strong> {selectedClaim.problem_details}</p>
                            </div>

                            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">স্ট্যাটাস পরিবর্তন করুন:</label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="w-full text-xs font-bold px-3 py-2 rounded-xl border focus:border-blue-500"
                                    >
                                        <option value="pending">অপেক্ষমাণ (Pending)</option>
                                        <option value="under_review">রিভিউ চলছে (Under Review)</option>
                                        <option value="approved">অনুমোদিত (Approved)</option>
                                        <option value="rejected">বাতিল (Rejected)</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <LinkIcon className="w-3.5 h-3.5 text-blue-600" /> গুগল ড্রাইভ লিংক (ভিডিও লিংক):
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://drive.google.com/file/d/.../view"
                                        value={data.google_drive_link}
                                        onChange={e => setData('google_drive_link', e.target.value)}
                                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border focus:border-blue-500 font-mono"
                                    />
                                    <p className="text-[11px] text-slate-500">গ্রাহকের দেওয়া ড্রাইভ লিংকে ভুল থাকলে বা ভিডিও ছাড়া অন্য ফাইল হলে এখানে সঠিক লিংক দিতে পারেন।</p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700">এডমিন নোট (ঐচ্ছিক):</label>
                                    <textarea
                                        rows={3}
                                        placeholder="গ্রাহকের জন্য কোনো মেসেজ বা অভ্যন্তরীণ নোট..."
                                        value={data.admin_notes}
                                        onChange={e => setData('admin_notes', e.target.value)}
                                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedClaim(null)}
                                        className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                    >
                                        ক্যান্সেল
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                                    >
                                        {processing ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Media & Google Drive Preview Modal */}
                {previewMedia && (
                    <div 
                        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150" 
                        onClick={() => setPreviewMedia(null)}
                    >
                        <div 
                            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 border border-slate-200 dark:border-slate-800" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">ভিডিও প্রমাণ / ড্রাইভ ফাইল প্রিভিউ</span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                        {previewMedia.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {previewMedia.originalUrl && (
                                        <a
                                            href={previewMedia.originalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> নতুন ট্যাবে খুলুন
                                        </a>
                                    )}
                                    <button 
                                        onClick={() => setPreviewMedia(null)} 
                                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Drive Note Banner */}
                            {previewMedia.type === 'drive' && (
                                <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-900 dark:text-amber-200 text-xs">
                                    <Info className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                                    <div>
                                        <p className="font-bold">গুগল ড্রাইভ ফাইল সংক্রান্ত তথ্য:</p>
                                        <p className="mt-0.5 text-[11px] text-amber-800 dark:text-amber-300">
                                            গ্রাহক ক্লেইম করার সময় ড্রাইভের যে লিংকটি যুক্ত করেছেন, ড্রাইভ প্রিভিউতে ঠিক সেই ফাইলটিই লোড হয়। যদি গ্রাহক ভিডিওর বদলে কোনো কোড/JSON/ডকুমেন্ট ফাইল আপলোড করে লিংক দিয়ে থাকেন, ড্রাইভ সেটিই দেখাবে। প্রয়োজনে আপনি 'ভিউ ও এডিট' থেকে সঠিক ভিডিও লিংক পরিবর্তন করতে পারবেন।
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[350px]">
                                {previewMedia.type === 'video' ? (
                                    <video src={previewMedia.url} controls autoPlay className="w-full max-h-[70vh] rounded-2xl" />
                                ) : (
                                    <iframe
                                        src={previewMedia.url}
                                        className="w-full h-[65vh] border-0 rounded-2xl"
                                        allow="autoplay"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}
