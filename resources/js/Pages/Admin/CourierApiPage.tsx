import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Truck, 
    Key, 
    Lock, 
    ShieldCheck, 
    Save, 
    Building, 
    Globe, 
    CheckCircle2, 
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import Swal from 'sweetalert2';

interface MasterCourierApi {
    id: number;
    courier_name: string;
    is_active: boolean;
    api_key: string;
    secret_key: string;
    merchant_code: string;
    base_url: string;
    cod_vault_active: boolean;
    notes?: string;
}

interface CourierApiPageProps {
    courierApis?: MasterCourierApi[];
    totalApis?: number;
    activeApis?: number;
}

export default function CourierApiPage({
    courierApis = [],
    totalApis = 0,
    activeApis = 0
}: CourierApiPageProps) {
    const [showSecrets, setShowSecrets] = useState<{ [key: number]: boolean }>({});

    const toggleSecretVisibility = (id: number) => {
        setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <>
            <Head title="Super Admin Master Courier API Management" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                Central Master Courier Gateway & Vault System
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Super Admin Master Courier APIs</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-2xl">
                                প্ল্যাটফর্মের সমস্ত কুরিয়ার পার্সেল পাঠাতে এখানে আপনার স্টিডফাস্ট, পাঠাও, রেডএক্স ও পেপারফ্লাইয়ের **Master API Key & Secret Key** কনফিগার করুন। কাস্টমারের ক্যাশ অন ডেলিভারি (COD) সরাসরি আপনার ভল্টে জমা হবে।
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>{activeApis} Active Master API Credentials</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Master API Credentials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {courierApis.map((courier) => (
                        <CourierCard 
                            key={courier.id} 
                            courier={courier} 
                            showSecret={!!showSecrets[courier.id]}
                            onToggleSecret={() => toggleSecretVisibility(courier.id)}
                        />
                    ))}
                </div>

            </div>
        </>
    );
}

function CourierCard({ courier, showSecret, onToggleSecret }: { courier: MasterCourierApi, showSecret: boolean, onToggleSecret: () => void }) {
    const { data, setData, post, put, processing } = useForm({
        courier_name: courier.courier_name,
        api_key: courier.api_key,
        secret_key: courier.secret_key,
        merchant_code: courier.merchant_code,
        base_url: courier.base_url,
        is_active: courier.is_active,
        notes: courier.notes || '',
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/courier-api/${courier.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: `Master ${courier.courier_name} API credentials updated!`,
                    showConfirmButton: false,
                    timer: 3500,
                    timerProgressBar: true,
                });
            }
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-black text-lg shrink-0">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white">
                            {courier.courier_name}
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-block mt-0.5">
                            Platform Master Account Active
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Active</label>
                    <input 
                        type="checkbox" 
                        checked={data.is_active}
                        onChange={e => setData('is_active', e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500 cursor-pointer"
                    />
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
                
                {/* Master API Key */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-500" /> Master API Key *
                    </label>
                    <input 
                        type="text" 
                        value={data.api_key}
                        onChange={e => setData('api_key', e.target.value)}
                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                        placeholder="e.g. st_master_live_98421049182"
                        required
                    />
                </div>

                {/* Master Secret Key */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-indigo-500" /> Master Secret Key / Token *
                        </label>
                        <button 
                            type="button" 
                            onClick={onToggleSecret}
                            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {showSecret ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <input 
                        type={showSecret ? 'text' : 'password'}
                        value={data.secret_key}
                        onChange={e => setData('secret_key', e.target.value)}
                        className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                        placeholder="e.g. st_master_sec_891048102"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Merchant Code */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-indigo-500" /> Master Merchant Code
                        </label>
                        <input 
                            type="text" 
                            value={data.merchant_code}
                            onChange={e => setData('merchant_code', e.target.value)}
                            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                            placeholder="e.g. STEADFAST-MASTER"
                        />
                    </div>

                    {/* API Base URL */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-indigo-500" /> API Base URL
                        </label>
                        <input 
                            type="text" 
                            value={data.base_url}
                            onChange={e => setData('base_url', e.target.value)}
                            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                            placeholder="https://portal.steadfast.com.bd/api/v1"
                        />
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> Save Master {courier.courier_name} API Credentials
                    </button>
                </div>

            </form>

        </div>
    );
}
