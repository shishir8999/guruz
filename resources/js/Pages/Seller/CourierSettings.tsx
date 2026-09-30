import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Truck, 
    ShieldCheck, 
    CheckCircle2, 
    Key, 
    Lock, 
    MapPin, 
    Building, 
    Edit, 
    X, 
    Save, 
    BadgeCheck,
    Banknote,
    Server,
    ShieldAlert
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CourierItem {
    id: number;
    courier_name: string;
    is_enabled: boolean;
    master_api_key_configured: boolean;
    merchant_code: string;
    pickup_address: string;
    admin_approval_required: boolean;
    vault_collection_enabled: boolean;
    notes?: string;
}

interface CourierSettingsProps {
    couriers?: CourierItem[];
    totalCount?: number;
    activeCount?: number;
    shopAddress?: string;
}

export default function CourierSettings({
    couriers = [],
    totalCount = 0,
    activeCount = 0,
    shopAddress = 'House 42, Road 11, Block D, Banani, Dhaka'
}: CourierSettingsProps) {
    const [editingAddress, setEditingAddress] = useState(false);

    const { data, setData, put, processing } = useForm({
        pickup_address: shopAddress,
    });

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/seller/courier-settings/1`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingAddress(false);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Shop Pickup Address updated!',
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        });
    };

    return (
        <>
            <Head title="Courier Partners — Super Admin Master Gateway" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Banner Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                                Super Admin Master API Gateway Connected
                            </div>
                            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Courier Service Integration</h1>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 max-w-xl">
                                প্ল্যাটফর্মের সমস্ত কুরিয়ার সার্ভিস সুপার অ্যাডমিনের সেন্ট্রাল মার্চেন্ট API Key এবং Secret Key দিয়ে পরিচালিত হচ্ছে।
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Master API Gateway Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clear Policy Alert */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0 font-bold">
                            <Server className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-indigo-300">
                                কেন্দ্রীয় সুপার অ্যাডমিন কুরিয়ার এপিআই প্রটোকল
                            </h3>
                            <span className="text-xs text-slate-300 font-medium block mt-0.5">
                                সমস্ত শিপমেন্ট ও লেনদেন কুরিয়ার থেকে সরাসরি পরিচালিত হবার নিয়মাবলী
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-slate-300 font-medium leading-relaxed">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
                            <div className="font-bold text-white flex items-center gap-1.5">
                                <Key className="w-4 h-4 text-amber-400" /> 1. সুপার অ্যাডমিন মাস্টার API Key
                            </div>
                            <p>
                                কুরিয়ারের সমস্ত এপিআই কী (API Key) এবং সিক্রেট কী (Secret Key) **সুপার অ্যাডমিন প্যানেল** থেকে সেন্ট্রালি সেটিং করা থাকে। ভেন্ডরদের আলাদা কোনো এপিআই কী দিতে হয় না।
                            </p>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
                            <div className="font-bold text-white flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-emerald-400" /> 2. অ্যাডমিন ভল্টে ক্যাশ কালেকশন
                            </div>
                            <p>
                                কুরিয়ার কর্তৃক কাস্টমারদের থেকে তোলা সমস্ত টাকা আগে সুপার অ্যাডমিন সেন্ট্রাল একাউন্ট ও ভল্টে আসে। ভেন্ডর পে-আউট রিকোয়েস্ট পাঠালে সুপার অ্যাডমিন এপ্রুভালের মাধ্যমে ভেন্ডরের অ্যাকাউন্টে পৌঁছে দেয়।
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shop Pickup Address Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-indigo-600" /> Shop Default Pickup Hub Address
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                কুরিয়ার রাইডার আপনার দোকান থেকে পার্সেল পিকআপ করতে এই ঠিকানায় আসবে।
                            </p>
                        </div>

                        {!editingAddress && (
                            <button
                                onClick={() => setEditingAddress(true)}
                                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl font-bold text-xs transition border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer"
                            >
                                <Edit className="w-3.5 h-3.5" /> Edit Pickup Address
                            </button>
                        )}
                    </div>

                    {editingAddress ? (
                        <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
                            <textarea 
                                rows={2}
                                value={data.pickup_address}
                                onChange={e => setData('pickup_address', e.target.value)}
                                className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                placeholder="Enter exact shop pickup address"
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingAddress(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Save className="w-3.5 h-3.5" /> Save Address
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span>{shopAddress}</span>
                        </div>
                    )}
                </div>

                {/* Master Courier Partners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {couriers.map((courier) => (
                        <div 
                            key={courier.id} 
                            className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 rounded-3xl p-6 shadow-md space-y-5 relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center font-black text-lg shrink-0">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-base text-slate-900 dark:text-white">
                                            {courier.courier_name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                Master API Connected
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active
                                </span>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center gap-1">
                                        <Key className="w-3 h-3 text-indigo-500" /> API Credentials Mode
                                    </span>
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                        Super Admin Master API
                                    </span>
                                </div>

                                <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-800/60 pt-2">
                                    <span className="text-slate-500 font-bold uppercase text-[10px] flex items-center gap-1">
                                        <Building className="w-3 h-3 text-indigo-500" /> Platform Merchant Code
                                    </span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                        {courier.merchant_code}
                                    </span>
                                </div>
                            </div>

                            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-slate-900 dark:text-white block">Cash & Dispatch Security:</span>
                                    <span className="font-medium text-slate-600 dark:text-slate-300">
                                        পিকআপ রিকোয়েস্ট পাঠালে এটি সুপার অ্যাডমিন ড্যাশবোর্ডে যাবে। অ্যাডমিন এপ্রুভ করার পরেই মাস্টার কুরিয়ারে সাবমিট হবে।
                                    </span>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </>
    );
}

CourierSettings.layout = (page: any) => <SellerLayout children={page} />;
