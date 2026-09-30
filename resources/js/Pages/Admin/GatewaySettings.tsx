import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    CreditCard, Save, CheckCircle2, Upload, Trash2, 
    QrCode, Landmark, Banknote, ShieldCheck, HelpCircle, Phone, Info,
    Key, Lock, Eye, EyeOff, Copy, Check, Plus, RefreshCw, X, Search, 
    SlidersHorizontal, ExternalLink, Truck, Smartphone
} from 'lucide-react';
import Swal from 'sweetalert2';
import { GatewayLogo } from '@/Components/PaymentGatewayIcons';

interface GatewayItem {
    id: number;
    code: string;
    name: string;
    name_bn: string | null;
    logo_url: string | null;
    is_active: boolean;
    gateway_type?: string;
    environment?: string;
    api_key?: string;
    secret_key?: string;
    app_key?: string;
    app_secret?: string;
    merchant_id?: string;
    token_id?: string;
    webhook_secret?: string;
    callback_url?: string;
    extra_config?: Record<string, any>;
    account_number: string;
    account_type: string;
    qr_image_url: string | null;
    bank_name: string;
    branch_name: string;
    account_holder_name: string;
    routing_number: string;
    instructions: string;
    sort_order: number;
}

interface Props {
    gateways: GatewayItem[];
}

export default function GatewaySettings({ gateways: initialGateways }: Props) {
    const defaultGatewaysMap: Record<string, GatewayItem> = {};
    initialGateways.forEach(gw => {
        defaultGatewaysMap[gw.code] = { 
            ...gw,
            extra_config: gw.extra_config || {}
        };
    });

    const [activeTab, setActiveTab] = useState<'api' | 'manual'>('api');
    const [qrPreviews, setQrPreviews] = useState<Record<string, string>>({});
    const [showSecretKeys, setShowSecretKeys] = useState<Record<string, boolean>>({});
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [savingCode, setSavingCode] = useState<string | null>(null);

    const { data, setData } = useForm<{
        gateways: Record<string, GatewayItem>;
    }>({
        gateways: defaultGatewaysMap
    });

    const handleCopy = (text: string, identifier: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(identifier);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleFieldChange = (code: string, field: string, value: any) => {
        setData(prev => ({
            ...prev,
            gateways: {
                ...prev.gateways,
                [code]: {
                    ...prev.gateways[code],
                    [field]: value
                }
            }
        }));
    };

    const handleExtraConfigChange = (code: string, subField: string, value: any) => {
        setData(prev => ({
            ...prev,
            gateways: {
                ...prev.gateways,
                [code]: {
                    ...prev.gateways[code],
                    extra_config: {
                        ...(prev.gateways[code]?.extra_config || {}),
                        [subField]: value
                    }
                }
            }
        }));
    };

    const toggleStatus = (code: string) => {
        const current = !!data.gateways[code]?.is_active;
        const next = !current;
        handleFieldChange(code, 'is_active', next);

        // Auto-save toggle change immediately so checkout reflects status instantly
        router.post('/admin/finance/gateway-settings', {
            gateways: {
                [code]: {
                    ...(data.gateways[code] || {}),
                    is_active: next
                }
            }
        }, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `${data.gateways[code]?.name || code} স্ট্যাটাস ${next ? 'চালু (Active)' : 'বন্ধ (Inactive)'} করা হয়েছে!`,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                });
            }
        });
    };

    // Save individual gateway
    const handleUpdateSingleGateway = (code: string, displayName: string) => {
        setSavingCode(code);
        const gwData = data.gateways[code] || {};

        router.post('/admin/finance/gateway-settings', {
            gateways: {
                [code]: gwData
            }
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingCode(null);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `${displayName} কনফিগারেশন সংরক্ষিত হয়েছে!`,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                setSavingCode(null);
                Swal.fire('এরর', 'সংরক্ষণে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।', 'error');
            }
        });
    };

    // QR Image Upload Handler
    const handleQrUpload = (code: string, file: File) => {
        const previewUrl = URL.createObjectURL(file);
        setQrPreviews(prev => ({ ...prev, [code]: previewUrl }));

        const formData = new FormData();
        formData.append('code', code);
        formData.append('qr', file);

        router.post('/admin/finance/gateway-qr-upload', formData, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'QR কোড ইমেজ আপলোড সফল হয়েছে!',
                    showConfirmButton: false,
                    timer: 2500,
                });
            }
        });
    };

    const [uploadingLogoCode, setUploadingLogoCode] = useState<string | null>(null);
    const [logoPreviews, setLogoPreviews] = useState<Record<string, string>>({});

    const handleLogoUpload = async (code: string, file: File) => {
        setUploadingLogoCode(code);
        const localPreview = URL.createObjectURL(file);
        setLogoPreviews(prev => ({ ...prev, [code]: localPreview }));

        const formData = new FormData();
        formData.append('code', code);
        formData.append('logo', file);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const response = await fetch('/admin/finance/gateway-settings/upload-logo', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            const res = await response.json();
            if (res.success) {
                handleFieldChange(code, 'logo_url', res.logo_url);
                setLogoPreviews(prev => ({ ...prev, [code]: res.logo_url }));
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'লোগো সফলভাবে আপলোড ও সেভ হয়েছে!',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                });
            } else {
                throw new Error(res.message || 'Upload failed');
            }
        } catch (err: any) {
            console.error('Logo upload error:', err);
            Swal.fire('এরর', 'লোগো আপলোড ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।', 'error');
        } finally {
            setUploadingLogoCode(null);
        }
    };

    const handleLogoRemove = async (code: string) => {
        const confirm = await Swal.fire({
            title: 'লোগো মুছে ফেলতে চান?',
            text: 'ডিফল্ট আইকন পুনরায় সক্রিয় হবে।',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#ef4444',
        });

        if (!confirm.isConfirmed) return;

        setUploadingLogoCode(code);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const response = await fetch('/admin/finance/gateway-settings/remove-logo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({ code })
            });

            const res = await response.json();
            if (res.success) {
                handleFieldChange(code, 'logo_url', null);
                setLogoPreviews(prev => {
                    const next = { ...prev };
                    delete next[code];
                    return next;
                });
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'লোগো মুছে ফেলা হয়েছে এবং ডিফল্ট আইকন সেট হয়েছে!',
                    showConfirmButton: false,
                    timer: 2500,
                });
            }
        } catch (err) {
            console.error('Logo remove error:', err);
            Swal.fire('এরর', 'লোগো রিমুভ করতে সমস্যা হয়েছে।', 'error');
        } finally {
            setUploadingLogoCode(null);
        }
    };

    const renderLogoSection = (code: string, gw: Partial<GatewayItem>, isCodFallback = false) => {
        const currentUrl = logoPreviews[code] || gw.logo_url;
        const isUploading = uploadingLogoCode === code;

        return (
            <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {isCodFallback && !currentUrl ? (
                            <div className="w-full h-full rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Truck size={24} />
                            </div>
                        ) : code === 'manual_dropdown' && !currentUrl ? (
                            <div className="w-full h-full rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <Smartphone size={24} />
                            </div>
                        ) : (
                            <GatewayLogo code={code} customUrl={currentUrl} size={40} />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 flex items-center gap-1.5 flex-wrap">
                            <span>পেমেন্ট গেটওয়ে লোগো</span>
                            {currentUrl ? (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">কাস্টম লোগো সক্রিয়</span>
                            ) : (
                                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">ডিফল্ট আইকন</span>
                            )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                            চেকআউটে প্রদর্শনের জন্য কাস্টম লোগো আপলোড করুন
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <label className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-500 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs hover:bg-slate-100 flex items-center gap-1.5">
                        <Upload size={13} className={isUploading ? 'animate-bounce' : ''} />
                        <span>{isUploading ? 'আপলোড হচ্ছে...' : (currentUrl ? 'লোগো পরিবর্তন' : 'লোগো আপলোড')}</span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isUploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleLogoUpload(code, file);
                                e.target.value = '';
                            }}
                        />
                    </label>

                    {currentUrl && (
                        <button
                            type="button"
                            onClick={() => handleLogoRemove(code)}
                            disabled={isUploading}
                            title="ডিফল্ট লোগোতে ফিরে যান"
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">রিসেট</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Helper to get or fallback gateway object
    const getGw = (code: string): Partial<GatewayItem> => {
        return data.gateways[code] || {
            code,
            name: code,
            is_active: false,
            extra_config: {}
        };
    };

    return (
        <>
            <Head title="Payment Gateways — Super Admin" />

            <div className="space-y-6 pb-12">
                {/* ─── 1. TOP HEADER ─── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            <span>Payment Gateways</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Manage API credentials & status
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Manual Payment Tab Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setActiveTab(activeTab === 'api' ? 'manual' : 'api')}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                                activeTab === 'manual'
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                    : 'bg-slate-50 hover:bg-slate-100 text-purple-700 border-purple-200 shadow-2xs'
                            }`}
                        >
                            <Landmark size={15} />
                            <span>{activeTab === 'manual' ? 'অটোমেটেড API গেটওয়ে দেখুন' : 'ম্যানুয়াল পেমেন্ট'}</span>
                        </button>
                    </div>
                </div>

                {/* ─── TAB NAVIGATION PILL ─── */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab('api')}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'api'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <CreditCard size={14} className="text-blue-600" />
                        <span>অটোমেটেড API গেটওয়ে (bKash, SSLCommerz, বাংলা কিউআর, ইত্যাদি)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'manual'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Banknote size={14} className="text-emerald-600" />
                        <span>ম্যানুয়াল পেমেন্ট ও ক্যাশ অন ডেলিভারি</span>
                    </button>
                </div>

                {/* ─── 2. AUTOMATED API GATEWAYS GRID ─── */}
                {activeTab === 'api' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* ─────────────────────────────────────────────────────────────
                            CARD 1: bKash Merchant (Direct API Integration)
                        ───────────────────────────────────────────────────────────── */}
                        {(() => {
                            const gw = getGw('bkash');
                            const isSubmitting = savingCode === 'bkash';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#e2136e] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">bKash Merchant</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">Direct API Integration</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="bkash" customUrl={logoPreviews['bkash'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('bkash', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">USER NAME</label>
                                                <input
                                                    type="text"
                                                    value={gw.merchant_id || ''}
                                                    onChange={(e) => handleFieldChange('bkash', 'merchant_id', e.target.value)}
                                                    placeholder="sandboxTokenizedUser02"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">PASSWORD</label>
                                                <input
                                                    type="password"
                                                    value={gw.token_id || ''}
                                                    onChange={(e) => handleFieldChange('bkash', 'token_id', e.target.value)}
                                                    placeholder="sandboxTokenizedUser02@12345"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e] transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">APP KEY</label>
                                                <input
                                                    type="text"
                                                    value={gw.app_key || ''}
                                                    onChange={(e) => handleFieldChange('bkash', 'app_key', e.target.value)}
                                                    placeholder="4f6o0cjikj2rfm34kfdad1eqq"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">APP SECRET</label>
                                                <input
                                                    type="password"
                                                    value={gw.app_secret || ''}
                                                    onChange={(e) => handleFieldChange('bkash', 'app_secret', e.target.value)}
                                                    placeholder="2ls7hdktrekvrb1jh441i3d911dtjo4pasmjv5v5qr31ug4b"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e] transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">BASE URL</label>
                                            <input
                                                type="text"
                                                value={gw.callback_url || ''}
                                                onChange={(e) => handleFieldChange('bkash', 'callback_url', e.target.value)}
                                                placeholder="https://tokenized.sandbox.bka.sh/v1.2.0-beta"
                                                className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e] transition"
                                            />
                                        </div>

                                        {/* Status Toggle Switch */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#e2136e] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('bkash')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#e2136e]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('bkash', 'bKash Merchant')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#e2136e] hover:bg-[#c20f5c] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE BKASH CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ─────────────────────────────────────────────────────────────
                            CARD 2: ShurjoPay (Payment Aggregator)
                        ───────────────────────────────────────────────────────────── */}
                        {(() => {
                            const gw = getGw('shurjopay');
                            const isSubmitting = savingCode === 'shurjopay';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#1a73e8] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">ShurjoPay</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">Payment Aggregator</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="shurjopay" customUrl={logoPreviews['shurjopay'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('shurjopay', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">USER NAME</label>
                                                <input
                                                    type="text"
                                                    value={gw.merchant_id || ''}
                                                    onChange={(e) => handleFieldChange('shurjopay', 'merchant_id', e.target.value)}
                                                    placeholder="sp_sandbox"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#1a73e8] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">PREFIX</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_number || ''}
                                                    onChange={(e) => handleFieldChange('shurjopay', 'account_number', e.target.value)}
                                                    placeholder="NOK"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#1a73e8] transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">PASSWORD</label>
                                                <input
                                                    type="password"
                                                    value={gw.secret_key || ''}
                                                    onChange={(e) => handleFieldChange('shurjopay', 'secret_key', e.target.value)}
                                                    placeholder="pyykd7hu&6u6"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#1a73e8] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">BASE URL</label>
                                                <input
                                                    type="text"
                                                    value={gw.callback_url || ''}
                                                    onChange={(e) => handleFieldChange('shurjopay', 'callback_url', e.target.value)}
                                                    placeholder="https://sandbox.shurjopayment.com"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#1a73e8] transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">SUCCESS URL</label>
                                                <input
                                                    type="text"
                                                    value={gw.extra_config?.success_url || ''}
                                                    onChange={(e) => handleExtraConfigChange('shurjopay', 'success_url', e.target.value)}
                                                    placeholder="https://yourdomain.com/payment-success"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#1a73e8] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">RETURN URL</label>
                                                <input
                                                    type="text"
                                                    value={gw.extra_config?.return_url || ''}
                                                    onChange={(e) => handleExtraConfigChange('shurjopay', 'return_url', e.target.value)}
                                                    placeholder="https://yourdomain.com/"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#1a73e8] transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Toggle Switch */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#1a73e8] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('shurjopay')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#1a73e8]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('shurjopay', 'ShurjoPay')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#1a73e8] hover:bg-[#1558b0] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE SHURJOPAY CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ─────────────────────────────────────────────────────────────
                            CARD 3: UddoktaPay (Automated Payment)
                        ───────────────────────────────────────────────────────────── */}
                        {(() => {
                            const gw = getGw('uddoktapay');
                            const isSubmitting = savingCode === 'uddoktapay';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#10b981] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">UddoktaPay</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">Automated Payment</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="uddoktapay" customUrl={logoPreviews['uddoktapay'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('uddoktapay', gw)}

                                        <div className="space-y-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">API KEY</label>
                                                <input
                                                    type="text"
                                                    value={gw.api_key || ''}
                                                    onChange={(e) => handleFieldChange('uddoktapay', 'api_key', e.target.value)}
                                                    placeholder="982d381360a69d419689740d9f2a26ce39fb7a50"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#10b981] transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">API BASE URL</label>
                                                <input
                                                    type="text"
                                                    value={gw.callback_url || ''}
                                                    onChange={(e) => handleFieldChange('uddoktapay', 'callback_url', e.target.value)}
                                                    placeholder="https://sandbox.uddoktapay.com/api/checkout-v2"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#10b981] transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Toggle Switch */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#10b981] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('uddoktapay')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#10b981]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('uddoktapay', 'UddoktaPay')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE UDDOKTAPAY CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ─────────────────────────────────────────────────────────────
                            CARD 4: aamarPay (Card & Mobile Banking)
                        ───────────────────────────────────────────────────────────── */}
                        {(() => {
                            const gw = getGw('aamarpay');
                            const isSubmitting = savingCode === 'aamarpay';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#f59e0b] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">aamarPay</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">Card & Mobile Banking</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="aamarpay" customUrl={logoPreviews['aamarpay'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('aamarpay', gw)}

                                        <div className="space-y-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">STORE ID</label>
                                                <input
                                                    type="text"
                                                    value={gw.merchant_id || gw.api_key || ''}
                                                    onChange={(e) => {
                                                        handleFieldChange('aamarpay', 'merchant_id', e.target.value);
                                                        handleFieldChange('aamarpay', 'api_key', e.target.value);
                                                    }}
                                                    placeholder="aamarpaytest"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#f59e0b] transition"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">Store ID is stored in App Key / Merchant field</p>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">SIGNATURE KEY</label>
                                                <input
                                                    type="password"
                                                    value={gw.secret_key || gw.app_secret || ''}
                                                    onChange={(e) => {
                                                        handleFieldChange('aamarpay', 'secret_key', e.target.value);
                                                        handleFieldChange('aamarpay', 'app_secret', e.target.value);
                                                    }}
                                                    placeholder="dbb74854e82415a2f7ff0ec3a97e4183"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#f59e0b] transition"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1">Signature Key is stored in App Secret field</p>
                                            </div>
                                        </div>

                                        {/* Status Toggle Switch */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#f59e0b] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('aamarpay')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#f59e0b]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('aamarpay', 'aamarPay')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE AAMARPAY CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ─────────────────────────────────────────────────────────────
                            CARD 5: SSLCommerz (Automated Payment Gateway)
                        ───────────────────────────────────────────────────────────── */}
                        {(() => {
                            const gw = getGw('sslcommerz');
                            const isSubmitting = savingCode === 'sslcommerz';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#08324f] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">SSLCommerz</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">Bangladesh's Largest Payment Gateway (Cards, Net Banking, MFS)</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="sslcommerz" customUrl={logoPreviews['sslcommerz'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('sslcommerz', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">STORE ID</label>
                                                <input
                                                    type="text"
                                                    value={gw.merchant_id || ''}
                                                    onChange={(e) => handleFieldChange('sslcommerz', 'merchant_id', e.target.value)}
                                                    placeholder="testbox_live"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#08324f] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">STORE PASSWORD</label>
                                                <input
                                                    type="password"
                                                    value={gw.secret_key || ''}
                                                    onChange={(e) => handleFieldChange('sslcommerz', 'secret_key', e.target.value)}
                                                    placeholder="••••••••••••"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#08324f] transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ENVIRONMENT</label>
                                                <select
                                                    value={gw.environment || 'sandbox'}
                                                    onChange={(e) => handleFieldChange('sslcommerz', 'environment', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#08324f] transition"
                                                >
                                                    <option value="sandbox">Sandbox (Testing)</option>
                                                    <option value="live">Live (Production)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">BASE URL</label>
                                                <input
                                                    type="text"
                                                    value={gw.callback_url || (gw.environment === 'live' ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com')}
                                                    onChange={(e) => handleFieldChange('sslcommerz', 'callback_url', e.target.value)}
                                                    placeholder="https://sandbox.sslcommerz.com"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#08324f] transition"
                                                />
                                            </div>
                                        </div>

                                        {/* Status Toggle Switch */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#08324f] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('sslcommerz')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#08324f]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('sslcommerz', 'SSLCommerz')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#08324f] hover:bg-[#062438] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE SSLCOMMERZ CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* ─────────────────────────────────────────────────────────────
                            CARD 6: বাংলা কিউআর (Bangla QR Payment Gateway)
                        ───────────────────────────────────────────────────────────── */}
                        {(() => {
                            const gw = getGw('bangla_qr');
                            const isSubmitting = savingCode === 'bangla_qr';
                            const qrPreview = qrPreviews['bangla_qr'] || gw.qr_image_url;

                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#059669] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">বাংলা কিউআর (Bangla QR)</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">National QR Code Payment Standard (Any Bank / MFS App)</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="bangla_qr" customUrl={logoPreviews['bangla_qr'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('bangla_qr', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">MERCHANT / ACCOUNT ID</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_number || ''}
                                                    onChange={(e) => handleFieldChange('bangla_qr', 'account_number', e.target.value)}
                                                    placeholder="017XXXXXXXX / Merchant ID"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#059669] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">BANK / ISSUER NAME</label>
                                                <input
                                                    type="text"
                                                    value={gw.bank_name || ''}
                                                    onChange={(e) => handleFieldChange('bangla_qr', 'bank_name', e.target.value)}
                                                    placeholder="City Bank / Brac Bank / bKash QR"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#059669] transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">INSTRUCTIONS</label>
                                            <input
                                                type="text"
                                                value={gw.instructions || ''}
                                                onChange={(e) => handleFieldChange('bangla_qr', 'instructions', e.target.value)}
                                                placeholder="যেকোনো ব্যাংক বা ওয়ালেট অ্যাপ দিয়ে বাংলা কিউআর স্ক্যান করে দ্রুত পেমেন্ট করুন"
                                                className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#059669] transition"
                                            />
                                        </div>

                                        {/* QR Code Upload Section */}
                                        <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/60 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                {qrPreview ? (
                                                    <img src={qrPreview} alt="Bangla QR" className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 shadow-2xs" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                        <QrCode size={22} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs font-black text-slate-800">বাংলা কিউআর ইমেজ আপলোড</p>
                                                    <p className="text-[10px] text-slate-500">গ্রাহক চেকআউটে কিউআর কোড স্ক্যান করে পে করতে পারবেন</p>
                                                </div>
                                            </div>

                                            <label className="px-3 py-1.5 bg-white border border-emerald-300 hover:border-emerald-500 text-emerald-700 rounded-lg text-xs font-bold cursor-pointer transition shadow-2xs hover:bg-emerald-50 shrink-0">
                                                <span>ইমেজ বাছুন</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleQrUpload('bangla_qr', file);
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {/* Status Toggle Switch */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#059669] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('bangla_qr')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#059669]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('bangla_qr', 'বাংলা কিউআর')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE BANGLA QR CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                )}

                {/* ─── 3. MANUAL PAYMENTS & COD GRID ─── */}
                {activeTab === 'manual' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* ─────────────────────────────────────────────────────────────
                            CARD 0: ম্যানুয়াল পেমেন্ট মেথড ড্রপডাউন হেডার (Manual Dropdown Header Logo)
                        ───────────────────────────────────────────────────────────── */}
                        {(() => {
                            const gw = getGw('manual_dropdown');
                            const isSubmitting = savingCode === 'manual_dropdown';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-purple-600 overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">ম্যানুয়াল পেমেন্ট মেথড ড্রপডাউন (Header Logo)</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">চেকআউট পেজে ম্যানুয়াল পেমেন্ট অপশনের ড্রপডাউন বাটন লোগো</p>
                                            </div>
                                            <div className="shrink-0">
                                                {logoPreviews['manual_dropdown'] || gw.logo_url ? (
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden">
                                                        <img src={logoPreviews['manual_dropdown'] || gw.logo_url!} alt="Manual Dropdown" className="w-full h-full object-contain rounded-lg" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                                                        <Smartphone size={22} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {renderLogoSection('manual_dropdown', gw)}

                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">DROPDOWN TITLE (বাংলা নাম)</label>
                                            <input
                                                type="text"
                                                value={gw.name_bn || 'ম্যানুয়াল পেমেন্ট মেথড'}
                                                onChange={(e) => handleFieldChange('manual_dropdown', 'name_bn', e.target.value)}
                                                placeholder="ম্যানুয়াল পেমেন্ট মেথড"
                                                className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-purple-600 transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('manual_dropdown', 'ম্যানুয়াল পেমেন্ট হেডার')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE DROPDOWN CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Cash on Delivery */}
                        {(() => {
                            const gw = getGw('cod');
                            const isSubmitting = savingCode === 'cod';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-600 overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">ক্যাশ অন ডেলিভারি (Cash on Delivery)</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">পণ্য হাতে পেয়ে মূল্য পরিশোধ করার নিয়ম</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="cod" customUrl={logoPreviews['cod'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('cod', gw, true)}

                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">INSTRUCTIONS</label>
                                            <input
                                                type="text"
                                                value={gw.instructions || ''}
                                                onChange={(e) => handleFieldChange('cod', 'instructions', e.target.value)}
                                                placeholder="পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন"
                                                className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-600 transition"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('cod')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-emerald-600' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('cod', 'Cash on Delivery')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE COD CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Manual bKash */}
                        {(() => {
                            const gw = getGw('manual_bkash');
                            const isSubmitting = savingCode === 'manual_bkash';
                            const qrPreview = qrPreviews['manual_bkash'] || gw.qr_image_url;

                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#e2136e] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">Manual bKash</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">গ্রাহক পার্সোনাল/মার্চেন্ট নম্বরে সেন্ড মানি করে TrxID দেবে</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="manual_bkash" customUrl={logoPreviews['manual_bkash'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('manual_bkash', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT NUMBER</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_number || ''}
                                                    onChange={(e) => handleFieldChange('manual_bkash', 'account_number', e.target.value)}
                                                    placeholder="01XXXXXXXXX"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT TYPE</label>
                                                <select
                                                    value={gw.account_type || 'Personal'}
                                                    onChange={(e) => handleFieldChange('manual_bkash', 'account_type', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e] transition"
                                                >
                                                    <option value="Personal">Personal (সেন্ড মানি)</option>
                                                    <option value="Agent">Agent (ক্যাশ আউট)</option>
                                                    <option value="Merchant">Merchant (পেমেন্ট)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">INSTRUCTIONS</label>
                                            <input
                                                type="text"
                                                value={gw.instructions || ''}
                                                onChange={(e) => handleFieldChange('manual_bkash', 'instructions', e.target.value)}
                                                placeholder="ম্যানুয়াল — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন"
                                                className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#e2136e] transition"
                                            />
                                        </div>

                                        {/* QR Upload */}
                                        <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-200/60 flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                {qrPreview ? (
                                                    <img src={qrPreview} alt="QR" className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs">
                                                        <QrCode size={18} />
                                                    </div>
                                                )}
                                                <p className="text-xs font-bold text-slate-800">বিকাশ QR কোড (ঐচ্ছিক)</p>
                                            </div>
                                            <label className="px-3 py-1 bg-white border border-pink-300 hover:border-pink-500 text-pink-700 rounded-lg text-xs font-bold cursor-pointer transition">
                                                <span>আপলোড</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleQrUpload('manual_bkash', file);
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#e2136e] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('manual_bkash')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#e2136e]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('manual_bkash', 'Manual bKash')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#e2136e] hover:bg-[#c20f5c] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE MANUAL BKASH CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Nagad Manual */}
                        {(() => {
                            const gw = getGw('nagad');
                            const isSubmitting = savingCode === 'nagad';
                            const qrPreview = qrPreviews['nagad'] || gw.qr_image_url;

                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#ef4444] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">Nagad Manual</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">গ্রাহক নগদ নম্বরে সেন্ড মানি করে TrxID দেবে</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="nagad" customUrl={logoPreviews['nagad'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('nagad', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT NUMBER</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_number || ''}
                                                    onChange={(e) => handleFieldChange('nagad', 'account_number', e.target.value)}
                                                    placeholder="01XXXXXXXXX"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#ef4444] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT TYPE</label>
                                                <select
                                                    value={gw.account_type || 'Personal'}
                                                    onChange={(e) => handleFieldChange('nagad', 'account_type', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#ef4444] transition"
                                                >
                                                    <option value="Personal">Personal (সেন্ড মানি)</option>
                                                    <option value="Merchant">Merchant (পেমেন্ট)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">INSTRUCTIONS</label>
                                            <input
                                                type="text"
                                                value={gw.instructions || ''}
                                                onChange={(e) => handleFieldChange('nagad', 'instructions', e.target.value)}
                                                placeholder="ম্যানুয়াল — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন"
                                                className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#ef4444] transition"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#ef4444] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('nagad')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#ef4444]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('nagad', 'Nagad Manual')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE NAGAD CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Rocket Personal */}
                        {(() => {
                            const gw = getGw('rocket');
                            const isSubmitting = savingCode === 'rocket';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#8c3494] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">Rocket Personal</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">গ্রাহক রকেট নম্বরে সেন্ড মানি করে TrxID দেবে</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="rocket" customUrl={logoPreviews['rocket'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('rocket', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT NUMBER</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_number || ''}
                                                    onChange={(e) => handleFieldChange('rocket', 'account_number', e.target.value)}
                                                    placeholder="01XXXXXXXXX-X"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#8c3494] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT TYPE</label>
                                                <select
                                                    value={gw.account_type || 'Personal'}
                                                    onChange={(e) => handleFieldChange('rocket', 'account_type', e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#8c3494] transition"
                                                >
                                                    <option value="Personal">Personal</option>
                                                    <option value="Agent">Agent</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">INSTRUCTIONS</label>
                                            <input
                                                type="text"
                                                value={gw.instructions || ''}
                                                onChange={(e) => handleFieldChange('rocket', 'instructions', e.target.value)}
                                                placeholder="ম্যানুয়াল — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন"
                                                className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#8c3494] transition"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#8c3494] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('rocket')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#8c3494]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('rocket', 'Rocket Personal')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#8c3494] hover:bg-[#722579] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE ROCKET CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Bank Transfer */}
                        {(() => {
                            const gw = getGw('bank');
                            const isSubmitting = savingCode === 'bank';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-blue-600 overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">Bank Transfer</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">সরাসরি ব্যাংক একাউন্টে ডিপোজিট</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="bank" customUrl={logoPreviews['bank'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('bank', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">BANK NAME</label>
                                                <input
                                                    type="text"
                                                    value={gw.bank_name || ''}
                                                    onChange={(e) => handleFieldChange('bank', 'bank_name', e.target.value)}
                                                    placeholder="Islami Bank Bangladesh Ltd"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-600 transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">BRANCH NAME</label>
                                                <input
                                                    type="text"
                                                    value={gw.branch_name || ''}
                                                    onChange={(e) => handleFieldChange('bank', 'branch_name', e.target.value)}
                                                    placeholder="Dhanmondi Branch"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-600 transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT HOLDER</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_holder_name || ''}
                                                    onChange={(e) => handleFieldChange('bank', 'account_holder_name', e.target.value)}
                                                    placeholder="Your Company Ltd"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-600 transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT NUMBER</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_number || ''}
                                                    onChange={(e) => handleFieldChange('bank', 'account_number', e.target.value)}
                                                    placeholder="2050XXXXXXXXX"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-600 transition"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('bank')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-blue-600' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('bank', 'Bank Transfer')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE BANK CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Instant UPI (India) */}
                        {(() => {
                            const gw = getGw('upi_india');
                            const isSubmitting = savingCode === 'upi_india';
                            return (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs border-l-4 border-l-[#097939] overflow-hidden flex flex-col justify-between">
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-base font-black text-slate-900">ইউপিআই পেমেন্ট (ভারত 🇮🇳)</h3>
                                                <p className="text-[11px] text-slate-400 font-semibold">PhonePe, Google Pay, Paytm, BHIM UPI</p>
                                            </div>
                                            <div className="shrink-0">
                                                <GatewayLogo code="upi_india" customUrl={logoPreviews['upi_india'] || gw.logo_url} size={38} />
                                            </div>
                                        </div>

                                        {renderLogoSection('upi_india', gw)}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">UPI ID / VPA</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_number || ''}
                                                    onChange={(e) => handleFieldChange('upi_india', 'account_number', e.target.value)}
                                                    placeholder="username@upi / 98XXXXXXXX@paytm"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#097939] transition"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">ACCOUNT HOLDER</label>
                                                <input
                                                    type="text"
                                                    value={gw.account_holder_name || ''}
                                                    onChange={(e) => handleFieldChange('upi_india', 'account_holder_name', e.target.value)}
                                                    placeholder="Payee Name"
                                                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#097939] transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black tracking-wider text-slate-500 uppercase mb-1">INSTRUCTIONS</label>
                                            <input
                                                type="text"
                                                value={gw.instructions || ''}
                                                onChange={(e) => handleFieldChange('upi_india', 'instructions', e.target.value)}
                                                placeholder="PhonePe, Google Pay, Paytm, BHIM ইউপিআই দিয়ে পেমেন্ট"
                                                className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-[#097939] transition"
                                            />
                                        </div>

                                        {/* Status Toggle Switch */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2.5 h-2.5 rounded-full ${gw.is_active ? 'bg-[#097939] animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="text-xs font-bold text-slate-700">Gateway Status</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus('upi_india')}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                                    gw.is_active ? 'bg-[#097939]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span className={`w-5 h-5 rounded-full bg-white block transform transition-transform absolute top-0.5 ${
                                                    gw.is_active ? 'left-5.5' : 'left-0.5'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateSingleGateway('upi_india', 'UPI India')}
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 bg-[#097939] hover:bg-[#065c2b] text-white rounded-xl text-xs font-black tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Save size={14} />
                                            <span>{isSubmitting ? 'আপডেট হচ্ছে...' : 'UPDATE UPI INDIA CONFIG'}</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                )}
            </div>
        </>
    );
}
