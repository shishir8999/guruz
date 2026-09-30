import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Search, ShieldCheck, X, Clock, FileText, CheckCircle2, AlertTriangle, Building2, CreditCard, ExternalLink, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface KycItem {
    id: number;
    shop_name: string;
    shop_slug: string;
    owner_name: string;
    kyc_status: 'Pending' | 'Approved' | 'Rejected' | 'Not Submitted';
    docs_summary: string;
    shop_status: 'pending' | 'approved' | 'suspended';
    nid_number?: string;
    trade_license_number?: string;
    nid_front_image?: string;
    nid_back_image?: string;
    trade_license_image?: string;
    bank_statement_image?: string;
    bank_name?: string;
    account_name?: string;
    account_number?: string;
    branch_name?: string;
    routing_number?: string;
}

export default function VendorKycPage({ kycList: initialKycList }: { kycList: KycItem[] }) {
    const [kycList, setKycList] = useState<KycItem[]>(initialKycList || []);
    
    useEffect(() => {
        setKycList(initialKycList || []);
    }, [initialKycList]);

    const [filterStatus, setFilterStatus] = useState<'Pending' | 'Approved' | 'Rejected' | 'Not Submitted' | 'All'>('Pending');
    const [search, setSearch] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [activeKyc, setActiveKyc] = useState<KycItem | null>(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

    const isPdf = (url?: string | null) => url ? url.toLowerCase().endsWith('.pdf') : false;

    const filteredKyc = kycList.filter(k => {
        const matchesSearch = k.shop_name.toLowerCase().includes(search.toLowerCase()) || k.owner_name.toLowerCase().includes(search.toLowerCase());
        if (filterStatus === 'All') return matchesSearch;
        return matchesSearch && k.kyc_status === filterStatus;
    });

    const handleApproveKyc = (id: number) => {
        router.post(`/admin/vendor-kyc/${id}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReviewModal(false);
                setSuccessMsg('Vendor KYC Approved & Shop Activated!');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        });
    };

    const handleRejectKyc = (id: number) => {
        if (!rejectionReason.trim()) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please enter a rejection reason.', showConfirmButton: false, timer: 3000, timerProgressBar: true });
            return;
        }
        router.post(`/admin/vendor-kyc/${id}/reject`, { rejection_reason: rejectionReason }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReviewModal(false);
                setRejectionReason('');
                setSuccessMsg('Vendor KYC Rejected.');
                setTimeout(() => setSuccessMsg(''), 4000);
            }
        });
    };

    const tabs = (['Pending', 'Approved', 'Rejected', 'Not Submitted', 'All'] as const).map(st => ({
        key: st,
        label: st,
        count: kycList.filter(k => st === 'All' ? true : k.kyc_status === st).length
    }));

    return (
        <>

            <Head title="Vendor KYC — Admin Panel" />

            <div className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">

                {/* Toast Message */}
                {successMsg && (
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm fixed top-4 right-4 z-50 animate-bounce">
                        {successMsg}
                    </div>
                )}

                {/* Banner Header Card */}
                <div className="bg-gradient-to-r from-[#6b46c1] to-[#d53f8c] rounded-2xl p-5 shadow-sm text-white flex flex-col justify-center">
                    <h1 className="text-xl font-bold mb-1 tracking-tight">Vendor KYC / Document Verification</h1>
                    <p className="text-white/90 text-[13px] font-medium">
                        ভেন্ডরের KYC ডকুমেন্ট যাচাই করুন এবং শপ অ্যাপ্রুভ করার পূর্বে অনুমোদন দিন।
                    </p>
                </div>

                {/* Tabs & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {tabs.map((tab) => {
                            const isActive = filterStatus === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterStatus(tab.key)}
                                    className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                                        isActive 
                                            ? 'bg-[#10b981] text-white shadow-sm' 
                                            : 'bg-transparent text-slate-600 hover:bg-slate-100/80'
                                    }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search shop..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6b46c1] text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-white border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">SHOP</th>
                                    <th className="px-6 py-4">OWNER</th>
                                    <th className="px-6 py-4">KYC STATUS</th>
                                    <th className="px-6 py-4">DOCS</th>
                                    <th className="px-6 py-4">SHOP STATUS</th>
                                    <th className="px-6 py-4">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredKyc.map((k) => (
                                    <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* Shop Info */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800 text-[13px]">{k.shop_name}</div>
                                            <div className="text-[11px] text-slate-500">/{k.shop_slug}</div>
                                        </td>
                                        
                                        {/* Owner */}
                                        <td className="px-6 py-4 font-medium text-slate-600 text-[13px]">
                                            {k.owner_name || '-'}
                                        </td>
                                        
                                        {/* KYC Status */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                                                k.kyc_status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                                k.kyc_status === 'Rejected' ? 'bg-red-50 text-red-600' :
                                                k.kyc_status === 'Pending' ? 'bg-[#fef3c7] text-[#d97706]' :
                                                'bg-slate-50 text-slate-600'
                                            }`}>
                                                {k.kyc_status === 'Pending' && <Clock className="w-3.5 h-3.5 stroke-[2.5]" />}
                                                {k.kyc_status}
                                            </span>
                                        </td>

                                        {/* Docs */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                k.docs_summary.startsWith('0') 
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                                <FileText className="w-3.5 h-3.5" />
                                                {k.docs_summary.startsWith('0') ? 'শুধু টেক্সট (No File)' : `${k.docs_summary} ফাইল`}
                                            </span>
                                        </td>

                                        {/* Shop Status */}
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                                                k.shop_status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                                k.shop_status === 'suspended' ? 'bg-slate-100 text-slate-600' :
                                                'bg-[#fef3c7] text-[#d97706]'
                                            }`}>
                                                {k.shop_status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => { setActiveKyc(k); setShowReviewModal(true); }}
                                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold text-[12px] px-4 py-2 rounded-xl transition shadow-sm"
                                            >
                                                Review Documents
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {filteredKyc.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                                            No KYC applications found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Document Review Modal */}
            {showReviewModal && activeKyc && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
                        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#6b46c1]" /> Review KYC Documents - {activeKyc.shop_name}
                            </h3>
                            <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {(() => {
                            const hasAnyImages = Boolean(activeKyc.nid_front_image || activeKyc.nid_back_image || activeKyc.trade_license_image || activeKyc.bank_statement_image);
                            const hasBankInfo = Boolean(activeKyc.bank_name || activeKyc.account_number);
                            const showTradeLicense = Boolean(activeKyc.trade_license_image || (activeKyc.trade_license_number && activeKyc.trade_license_number !== 'Not Provided'));
                            const showBankStatement = Boolean(activeKyc.bank_statement_image);

                            return (
                                <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm max-h-[60vh] overflow-y-auto border border-slate-100">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <p className="text-slate-700"><strong className="text-slate-900">Owner:</strong> {activeKyc.owner_name}</p>
                                        <p className="text-slate-700"><strong className="text-slate-900">Shop Slug:</strong> {activeKyc.shop_slug}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-white rounded-lg border border-slate-200/80">
                                        <div><strong className="text-slate-900">NID Number:</strong> <span className="font-semibold text-indigo-700 font-mono ml-1">{activeKyc.nid_number || 'Not Provided'}</span></div>
                                        <div><strong className="text-slate-900">Trade License:</strong> <span className="font-semibold text-indigo-700 font-mono ml-1">{activeKyc.trade_license_number || 'Not Provided'}</span></div>
                                    </div>

                                    {/* Bank Information Card (if submitted) */}
                                    {hasBankInfo && (
                                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs space-y-2">
                                            <div className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                                <span>ব্যাংক ও পে-আউট তথ্য</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                                <div><span className="text-slate-500">ব্যাংক:</span> <strong className="text-slate-800 ml-1">{activeKyc.bank_name || '-'}</strong></div>
                                                <div><span className="text-slate-500">হিসাবের নাম:</span> <strong className="text-slate-800 ml-1">{activeKyc.account_name || '-'}</strong></div>
                                                <div><span className="text-slate-500">হিসাব নম্বর:</span> <strong className="text-slate-800 font-mono ml-1">{activeKyc.account_number || '-'}</strong></div>
                                                <div><span className="text-slate-500">শাখা / রাউটিং:</span> <strong className="text-slate-800 ml-1">{activeKyc.branch_name || '-'} {activeKyc.routing_number ? `(${activeKyc.routing_number})` : ''}</strong></div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Documents Section */}
                                    {!hasAnyImages ? (
                                        <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-center space-y-1.5 my-2">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
                                                <AlertCircle className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-xs font-bold text-amber-900">কোনো ডকুমেন্টের ছবি আপলোড করা হয়নি</h4>
                                            <p className="text-[11px] text-amber-700/90 leading-relaxed max-w-sm mx-auto">
                                                ভেন্ডর এখনও কোনো জাতীয় পরিচয়পত্র (NID) বা ট্রেড লাইসেন্সের ছবি আপলোড করেননি। শুধুমাত্র টেক্সট তথ্য ও ব্যাংক ডিটেইলস সাবমিট করেছেন।
                                            </p>
                                            <div className="pt-1">
                                                <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-200/60 px-3 py-1 rounded-full">
                                                    ℹ️ টেক্সট তথ্যাদি সঠিক থাকলে সরাসরি Approve KYC করতে পারেন
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="font-bold text-xs text-slate-700 uppercase">NID Front</p>
                                                    {activeKyc.nid_front_image && (
                                                        <a href={activeKyc.nid_front_image} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1">
                                                            <ExternalLink className="w-3 h-3" /> View Full
                                                        </a>
                                                    )}
                                                </div>
                                                {activeKyc.nid_front_image ? (
                                                    isPdf(activeKyc.nid_front_image) ? (
                                                        <a href={activeKyc.nid_front_image} target="_blank" rel="noreferrer" className="w-full h-28 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex flex-col items-center justify-center text-red-600 text-xs font-semibold gap-2 transition p-2 text-center">
                                                            <FileText className="w-8 h-8 text-red-500" />
                                                            <span>PDF ডকুমেন্ট দেখুন (Open PDF)</span>
                                                        </a>
                                                    ) : (
                                                        <div 
                                                            onClick={() => setPreviewImage({ url: activeKyc.nid_front_image!, title: `NID Front - ${activeKyc.shop_name}` })}
                                                            className="relative w-full h-28 bg-white rounded-lg border border-slate-200 shadow-sm p-1 group hover:border-indigo-500 transition cursor-zoom-in overflow-hidden"
                                                        >
                                                            <img 
                                                                src={activeKyc.nid_front_image} 
                                                                alt="NID Front" 
                                                                className="w-full h-full object-contain" 
                                                            />
                                                            <div className="absolute inset-0 bg-indigo-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 rounded-lg">
                                                                🔍 ক্লিক করে বড় করে দেখুন
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="w-full h-28 bg-slate-100/70 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs font-medium gap-1">
                                                        <FileText className="w-5 h-5 opacity-40" />
                                                        <span>ছবি আপলোড করা হয়নি</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="font-bold text-xs text-slate-700 uppercase">NID Back</p>
                                                    {activeKyc.nid_back_image && (
                                                        <a href={activeKyc.nid_back_image} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1">
                                                            <ExternalLink className="w-3 h-3" /> View Full
                                                        </a>
                                                    )}
                                                </div>
                                                {activeKyc.nid_back_image ? (
                                                    isPdf(activeKyc.nid_back_image) ? (
                                                        <a href={activeKyc.nid_back_image} target="_blank" rel="noreferrer" className="w-full h-28 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex flex-col items-center justify-center text-red-600 text-xs font-semibold gap-2 transition p-2 text-center">
                                                            <FileText className="w-8 h-8 text-red-500" />
                                                            <span>PDF ডকুমেন্ট দেখুন (Open PDF)</span>
                                                        </a>
                                                    ) : (
                                                        <div 
                                                            onClick={() => setPreviewImage({ url: activeKyc.nid_back_image!, title: `NID Back - ${activeKyc.shop_name}` })}
                                                            className="relative w-full h-28 bg-white rounded-lg border border-slate-200 shadow-sm p-1 group hover:border-indigo-500 transition cursor-zoom-in overflow-hidden"
                                                        >
                                                            <img 
                                                                src={activeKyc.nid_back_image} 
                                                                alt="NID Back" 
                                                                className="w-full h-full object-contain" 
                                                            />
                                                            <div className="absolute inset-0 bg-indigo-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 rounded-lg">
                                                                🔍 ক্লিক করে বড় করে দেখুন
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="w-full h-28 bg-slate-100/70 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs font-medium gap-1">
                                                        <FileText className="w-5 h-5 opacity-40" />
                                                        <span>ছবি আপলোড করা হয়নি</span>
                                                    </div>
                                                )}
                                            </div>

                                            {showTradeLicense && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <p className="font-bold text-xs text-slate-700 uppercase">Trade License</p>
                                                        {activeKyc.trade_license_image && (
                                                            <a href={activeKyc.trade_license_image} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1">
                                                                <ExternalLink className="w-3 h-3" /> View Full
                                                            </a>
                                                        )}
                                                    </div>
                                                    {activeKyc.trade_license_image ? (
                                                        isPdf(activeKyc.trade_license_image) ? (
                                                            <a href={activeKyc.trade_license_image} target="_blank" rel="noreferrer" className="w-full h-28 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex flex-col items-center justify-center text-red-600 text-xs font-semibold gap-2 transition p-2 text-center">
                                                                <FileText className="w-8 h-8 text-red-500" />
                                                                <span>PDF ডকুমেন্ট দেখুন (Open PDF)</span>
                                                            </a>
                                                        ) : (
                                                            <div 
                                                                onClick={() => setPreviewImage({ url: activeKyc.trade_license_image!, title: `Trade License - ${activeKyc.shop_name}` })}
                                                                className="relative w-full h-28 bg-white rounded-lg border border-slate-200 shadow-sm p-1 group hover:border-indigo-500 transition cursor-zoom-in overflow-hidden"
                                                            >
                                                                <img 
                                                                    src={activeKyc.trade_license_image} 
                                                                    alt="Trade License" 
                                                                    className="w-full h-full object-contain" 
                                                                />
                                                                <div className="absolute inset-0 bg-indigo-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 rounded-lg">
                                                                    🔍 ক্লিক করে বড় করে দেখুন
                                                                </div>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="w-full h-28 bg-slate-100/70 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs font-medium gap-1">
                                                            <FileText className="w-5 h-5 opacity-40" />
                                                            <span>ছবি আপলোড করা হয়নি</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {showBankStatement && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <p className="font-bold text-xs text-slate-700 uppercase">Bank Statement</p>
                                                        {activeKyc.bank_statement_image && (
                                                            <a href={activeKyc.bank_statement_image} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1">
                                                                <ExternalLink className="w-3 h-3" /> View Full
                                                            </a>
                                                        )}
                                                    </div>
                                                    {activeKyc.bank_statement_image ? (
                                                        isPdf(activeKyc.bank_statement_image) ? (
                                                            <a href={activeKyc.bank_statement_image} target="_blank" rel="noreferrer" className="w-full h-28 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 flex flex-col items-center justify-center text-red-600 text-xs font-semibold gap-2 transition p-2 text-center">
                                                                <FileText className="w-8 h-8 text-red-500" />
                                                                <span>PDF ডকুমেন্ট দেখুন (Open PDF)</span>
                                                            </a>
                                                        ) : (
                                                            <div 
                                                                onClick={() => setPreviewImage({ url: activeKyc.bank_statement_image!, title: `Bank Statement - ${activeKyc.shop_name}` })}
                                                                className="relative w-full h-28 bg-white rounded-lg border border-slate-200 shadow-sm p-1 group hover:border-indigo-500 transition cursor-zoom-in overflow-hidden"
                                                            >
                                                                <img 
                                                                    src={activeKyc.bank_statement_image} 
                                                                    alt="Bank Statement" 
                                                                    className="w-full h-full object-contain" 
                                                                />
                                                                <div className="absolute inset-0 bg-indigo-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 rounded-lg">
                                                                    🔍 ক্লিক করে বড় করে দেখুন
                                                                </div>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="w-full h-28 bg-slate-100/70 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs font-medium gap-1">
                                                            <FileText className="w-5 h-5 opacity-40" />
                                                            <span>ছবি আপলোড করা হয়নি</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div className="pt-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Rejection Reason (if rejecting)</label>
                            <textarea 
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b46c1] focus:border-transparent placeholder-slate-400"
                                rows={2}
                                placeholder="State the reason if rejecting..."
                            ></textarea>
                        </div>

                        <div className="pt-3 flex gap-3">
                            <button
                                onClick={() => handleRejectKyc(activeKyc.id)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition"
                            >
                                Reject KYC
                            </button>
                            <button
                                onClick={() => handleApproveKyc(activeKyc.id)}
                                className="flex-1 bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl shadow-sm transition"
                            >
                                Approve KYC
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Lightbox / Image Zoom Modal */}
            {previewImage && (
                <div 
                    className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={() => setPreviewImage(null)}
                >
                    <div 
                        className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2 animate-in zoom-in-95 duration-200" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-3 border-b border-slate-100">
                            <span className="font-bold text-slate-800 text-sm">{previewImage.title}</span>
                            <div className="flex items-center gap-3">
                                <a 
                                    href={previewImage.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" /> নতুন ট্যাবে খুলুন (Open Tab)
                                </a>
                                <button 
                                    onClick={() => setPreviewImage(null)} 
                                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-3 flex items-center justify-center bg-slate-900/5 max-h-[75vh] overflow-auto">
                            <img 
                                src={previewImage.url} 
                                alt={previewImage.title} 
                                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-sm" 
                            />
                        </div>
                    </div>
                </div>
            )}
        
</>
    );
}
