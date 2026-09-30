import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Database, Download, Upload, Trash2, Play, AlertTriangle, 
    Loader2, CheckCircle2, ShieldCheck, RefreshCw, FileArchive, 
    Package, Users, ShoppingBag, HardDrive, Info, Sparkles, FileText, ArrowRight
} from 'lucide-react';
import Swal from 'sweetalert2';

interface BackupFile {
    name: string;
    path: string;
    type: 'full' | 'db';
    size: string;
    date: string;
}

interface Stats {
    total_products: number;
    total_users: number;
    total_orders: number;
    total_backups: number;
}

interface Props {
    backups: BackupFile[];
    stats?: Stats;
}

export default function DatabaseBackup({ backups = [], stats }: Props) {
    const [isCreatingFull, setIsCreatingFull] = useState(false);
    const [isCreatingDb, setIsCreatingDb] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    
    // For restoring from uploaded file
    const restoreForm = useForm<{
        backup_file: File | null;
        filename: string;
    }>({
        backup_file: null,
        filename: ''
    });
    
    // For deleting backup
    const deleteForm = useForm();

    const handleCreateBackup = (type: 'full' | 'db') => {
        if (type === 'full') {
            setIsCreatingFull(true);
        } else {
            setIsCreatingDb(true);
        }

        router.post('/admin/system/backups/create', { type }, {
            onFinish: () => {
                setIsCreatingFull(false);
                setIsCreatingDb(false);
            },
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: type === 'full' ? 'ফুল ব্যাকআপ সম্পন্ন!' : 'ডাটাবেজ ব্যাকআপ সম্পন্ন!',
                    text: type === 'full' 
                        ? 'ডাটাবেজ এবং মিডিয়া ছবিসহ সম্পূর্ণ ওয়েবসাইটের জিপ ব্যাকআপ ফাইল তৈরি হয়েছে।' 
                        : 'ডাটাবেজের SQL ফাইল সফলভাবে তৈরি হয়েছে।',
                    confirmButtonColor: '#4F46E5',
                    confirmButtonText: 'ঠিক আছে'
                });
            },
            onError: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'ব্যর্থ হয়েছে',
                    text: 'ব্যাকআপ ফাইল তৈরি করা সম্ভব হয়নি। অনুগ্রহ করে সার্ভার লগ চেক করুন।',
                    confirmButtonColor: '#EF4444'
                });
            }
        });
    };

    const handleDelete = (filename: string) => {
        Swal.fire({
            title: 'ব্যাকআপ মুছে ফেলবেন?',
            text: `আপনি কি নিশ্চিতভাবে "${filename}" ফাইলটি মুছে ফেলতে চান?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteForm.delete('/admin/system/backups/' + filename, {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'মুছে ফেলা হয়েছে',
                            text: 'ব্যাকআপ ফাইলটি সফলভাবে ডিলিট করা হয়েছে।',
                            confirmButtonColor: '#4F46E5'
                        });
                    }
                });
            }
        });
    };

    const handleRestoreServerFile = (backup: BackupFile) => {
        const isFull = backup.type === 'full';

        Swal.fire({
            title: isFull ? 'ফুল সাইট রিস্টোর করতে চান?' : 'ডাটাবেজ রিস্টোর করতে চান?',
            html: `
                <div class="text-left text-xs sm:text-sm space-y-3">
                    <p class="font-bold text-slate-800">নির্বাচিত ফাইল: <span class="font-mono text-indigo-600">${backup.name}</span></p>
                    <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1.5">
                        <div class="font-black flex items-center gap-1.5 text-amber-900">
                            <span>⚠️ সতর্কতা ও বিশেষ ফিচার:</span>
                        </div>
                        <p>১. বর্তমান ডাটাবেজ এই ব্যাকআপ ফাইলের ডাটা দিয়ে প্রতিস্থাপিত হবে।</p>
                        ${isFull ? '<p>২. প্রোডাক্টের ছবি ও মিডিয়া ফাইলগুলো স্বয়ংক্রিয়ভাবে রিস্টোর হবে।</p>' : ''}
                        <p class="text-indigo-700 font-semibold">৩. <strong>স্মার্ট স্কিমা আপডেট:</strong> আপনি যদি সাইটে নতুন কোনো ফিচার এনে থাকেন, রিস্টোর শেষে স্বয়ংক্রিয়ভাবে নতুন মাইগ্রেশনগুলো সক্রিয় হয়ে যাবে (নতুন ফিচার বা কলাম নষ্ট হবে না)।</p>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'হ্যাঁ, এখন রিস্টোর করুন',
            cancelButtonText: 'বাতিল',
            width: 520
        }).then((result) => {
            if (result.isConfirmed) {
                setIsRestoring(true);
                router.post('/admin/system/backups/restore', { filename: backup.name }, {
                    onFinish: () => setIsRestoring(false),
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'রিস্টোর সফল হয়েছে!',
                            text: 'আপনার সাইট আগের ডাটা ও ছবিসহ রিস্টোর হয়েছে এবং নতুন ডাটাবেজ স্কিমা স্বয়ংক্রিয়ভাবে আপডেট করা হয়েছে।',
                            confirmButtonColor: '#4F46E5'
                        });
                    },
                    onError: (err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'রিস্টোর ব্যর্থ হয়েছে',
                            text: Object.values(err)[0] || 'রিস্টোর সম্পন্ন করা যায়নি।',
                            confirmButtonColor: '#EF4444'
                        });
                    }
                });
            }
        });
    };

    const handleUploadRestore = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!restoreForm.data.backup_file) {
            Swal.fire('ফাইল নির্বাচন করুন', 'অনুগ্রহ করে একটি .zip বা .sql ফাইল নির্বাচন করুন।', 'warning');
            return;
        }

        const fileName = restoreForm.data.backup_file.name;
        const isZip = fileName.endsWith('.zip');

        Swal.fire({
            title: 'ব্যাকআপ ফাইল আপলোড ও রিস্টোর?',
            html: `
                <div class="text-left text-xs sm:text-sm space-y-3">
                    <p class="font-bold text-slate-800">আপলোড ফাইল: <span class="font-mono text-indigo-600">${fileName}</span></p>
                    <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-1.5">
                        <div class="font-black text-amber-900">⚠️ রিস্টোর নীতিমালা:</div>
                        <p>এই ফাইলটি আপলোড হয়ে বর্তমান সাইটের ডাটাবেজ${isZip ? ' ও মিডিয়া ফাইল' : ''} রিস্টোর করবে।</p>
                        <p class="text-indigo-700 font-semibold">স্বয়ংক্রিয় মাইগ্রেশন রান হবে, ফলে আপনার নতুন ডেভেলপ করা কোডের কোনো টেবিল মিসিং হবে না।</p>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4F46E5',
            cancelButtonColor: '#64748B',
            confirmButtonText: 'হ্যাঁ, আপলোড করে রিস্টোর করুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                setIsRestoring(true);
                restoreForm.post('/admin/system/backups/restore', {
                    forceFormData: true,
                    onFinish: () => setIsRestoring(false),
                    onSuccess: () => {
                        restoreForm.reset();
                        Swal.fire({
                            icon: 'success',
                            title: 'সফলভাবে রিস্টোর হয়েছে!',
                            text: 'আপনার ব্যাকআপ ফাইলটি থেকে সম্পূর্ণ ডাটা সফলভাবে রিস্টোর করা হয়েছে।',
                            confirmButtonColor: '#4F46E5'
                        });
                    },
                    onError: (err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'রিস্টোর ত্রুটি',
                            text: Object.values(err)[0] || 'ফাইল প্রসেস করতে ব্যর্থ হয়েছে।',
                            confirmButtonColor: '#EF4444'
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="ফুল সাইট ব্যাকআপ ও রিস্টোর হাব" />
            
            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>১০০% ডাটা ও মিডিয়া সুরক্ষা প্রযুক্তি</span>
                            </div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                                <HardDrive className="w-7 h-7 text-indigo-400" />
                                <span>ফুল সাইট ব্যাকআপ ও স্মার্ট রিস্টোর হাব</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                আপনার ওয়েবসাইটের সমস্ত তথ্য (ডাটাবেজ টেবিল, কাস্টমার, অর্ডার এবং প্রোডাক্টের মিডিয়া ছবি) এক ক্লিকে ডাউনলোড করুন। পরবর্তীতে নতুন ফিচার ডেভেলপ করার পর এই ব্যাকআপ ইমপোর্ট করলেও কোনো তথ্য হারাবে না এবং নতুন ফিচারও পুরোপুরি সচল থাকবে।
                            </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                            <button 
                                onClick={() => handleCreateBackup('full')}
                                disabled={isCreatingFull || isCreatingDb || isRestoring}
                                className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isCreatingFull ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FileArchive className="w-4 h-4 text-amber-300" />
                                )}
                                <span>{isCreatingFull ? 'প্যাকিং হচ্ছে...' : 'সম্পূর্ণ ব্যাকআপ (.ZIP)'}</span>
                            </button>

                            <button 
                                onClick={() => handleCreateBackup('db')}
                                disabled={isCreatingFull || isCreatingDb || isRestoring}
                                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isCreatingDb ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Database className="w-4 h-4 text-cyan-300" />
                                )}
                                <span>{isCreatingDb ? 'ডাম্পিং হচ্ছে...' : 'ডাটাবেজ ব্যাকআপ (.SQL)'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Stats Bar */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase">মোট প্রোডাক্ট</div>
                                <div className="text-base sm:text-lg font-black text-slate-800">{stats.total_products.toLocaleString()} টি</div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase">মোট ইউজার / কাস্টমার</div>
                                <div className="text-base sm:text-lg font-black text-slate-800">{stats.total_users.toLocaleString()} জন</div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase">মোট অর্ডার হিস্ট্রি</div>
                                <div className="text-base sm:text-lg font-black text-slate-800">{stats.total_orders.toLocaleString()} টি</div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <HardDrive className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-slate-500 uppercase">তৈরিকৃত ব্যাকআপ</div>
                                <div className="text-base sm:text-lg font-black text-slate-800">{stats.total_backups} টি ফাইল</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Restoring Overlay Banner if active */}
                {isRestoring && (
                    <div className="p-4 bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                        <span className="text-sm font-black text-indigo-900">
                            ওয়েবসাইট রিস্টোর ও ডাটাবেজ স্কিমা সিঙ্ক হচ্ছে... অনুগ্রহ করে পেজ রিফ্রেশ করবেন না।
                        </span>
                    </div>
                )}

                {/* Main Content Grid: Backups List & Upload Restore */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left 2 Cols: Backups List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xs border border-slate-100 overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-2">
                                    <FileArchive className="w-4 h-4 text-indigo-600" />
                                    <span>সংরক্ষিত ব্যাকআপ ফাইলসমূহ ({backups.length})</span>
                                </h2>
                                <p className="text-[11px] text-slate-500 mt-0.5">সার্ভারে তৈরি হওয়া ডাউনলোডযোগ্য ব্যাকআপ স্ন্যাপশট</p>
                            </div>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                                {backups.filter(b => b.type === 'full').length} ফুল জিপ | {backups.filter(b => b.type === 'db').length} ডাটাবেজ
                            </span>
                        </div>

                        <div className="overflow-x-auto grow">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-50 text-slate-600 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3">ব্যাকআপ ফাইল ও ধরন</th>
                                        <th className="px-3 py-3 whitespace-nowrap">সাইজ</th>
                                        <th className="px-3 py-3 whitespace-nowrap">তৈরির তারিখ ও সময়</th>
                                        <th className="px-4 py-3 text-right whitespace-nowrap">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {backups.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-16 text-center text-slate-500">
                                                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center mb-3">
                                                    <HardDrive className="w-7 h-7" />
                                                </div>
                                                <p className="font-bold text-slate-700 text-sm">কোনো ব্যাকআপ ফাইল পাওয়া যায়নি</p>
                                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                                    উপরের "সম্পূর্ণ ব্যাকআপ (.ZIP)" বাটনে ক্লিক করে পুরো সাইটের ফাইল ও ডাটাবেজ সেভ করে রাখুন।
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        backups.map((backup) => {
                                            const isFull = backup.type === 'full';
                                            return (
                                                <tr key={backup.name} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-xl shrink-0 ${
                                                                isFull 
                                                                    ? 'bg-indigo-50 text-indigo-600' 
                                                                    : 'bg-cyan-50 text-cyan-700'
                                                            }`}>
                                                                {isFull ? <FileArchive className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-mono font-bold text-slate-800 text-xs truncate max-w-xs sm:max-w-md">
                                                                    {backup.name}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className={`inline-block px-2 py-0.2 rounded-md text-[10px] font-bold ${
                                                                        isFull 
                                                                            ? 'bg-purple-100 text-purple-700' 
                                                                            : 'bg-sky-100 text-sky-800'
                                                                    }`}>
                                                                        {isFull ? 'ফুল সাইট (SQL + ছবি)' : 'শুধু ডাটাবেজ (SQL)'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3.5 font-mono text-slate-600 font-bold whitespace-nowrap text-xs">
                                                        {backup.size}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-slate-600 font-medium whitespace-nowrap text-xs">
                                                        {backup.date}
                                                    </td>
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <a 
                                                                href={'/admin/system/backups/' + backup.name + '/download'}
                                                                className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                                                title="ডাউনলোড করুন"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <span className="hidden sm:inline">ডাউনলোড</span>
                                                            </a>
                                                            <button 
                                                                onClick={() => handleRestoreServerFile(backup)}
                                                                disabled={isRestoring}
                                                                className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                                title="রিস্টোর করুন"
                                                            >
                                                                <Play className="w-3.5 h-3.5" />
                                                                <span className="hidden sm:inline">রিস্টোর</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(backup.name)}
                                                                disabled={isRestoring}
                                                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                                title="মুছে ফেলুন"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right 1 Col: Upload & Restore + Guidance Card */}
                    <div className="space-y-6">
                        
                        {/* Upload Card */}
                        <div className="bg-white rounded-2xl shadow-2xs border border-slate-100 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Upload className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-sm sm:text-base font-black text-slate-800">ফাইল আপলোড করে রিস্টোর</h3>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                পূর্বে ডাউনলোড করে রাখা <strong className="text-indigo-600">.zip</strong> বা <strong className="text-indigo-600">.sql</strong> ব্যাকআপ ফাইল নির্বাচন করুন:
                            </p>

                            <form onSubmit={handleUploadRestore} className="space-y-4">
                                <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-5 text-center bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors">
                                    <input 
                                        type="file" 
                                        accept=".zip,.sql"
                                        onChange={(e) => restoreForm.setData('backup_file', e.target.files?.[0] || null)}
                                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-2.5 font-medium">
                                        অনুমোদিত ফরম্যাট: <strong>.ZIP</strong> (সম্পূর্ণ সাইট) অথবা <strong>.SQL</strong>
                                    </p>
                                </div>
                                
                                {restoreForm.errors.backup_file && (
                                    <p className="text-xs text-rose-500 font-bold">{restoreForm.errors.backup_file}</p>
                                )}

                                <button 
                                    type="submit"
                                    disabled={!restoreForm.data.backup_file || restoreForm.processing || isRestoring}
                                    className="w-full bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs sm:text-sm disabled:opacity-50 cursor-pointer shadow-md"
                                >
                                    {restoreForm.processing || isRestoring ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4 text-emerald-400" />
                                    )}
                                    <span>{restoreForm.processing || isRestoring ? 'রিস্টোর প্রসেস হচ্ছে...' : 'আপলোড ও স্মার্ট রিস্টোর'}</span>
                                </button>
                            </form>
                        </div>

                        {/* Smart Future-Proof Guidance Box */}
                        <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/60 to-pink-50/80 rounded-2xl border border-indigo-100 p-5 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-900 font-black text-xs sm:text-sm">
                                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                                <span>নতুন ফিচার আনলেও ডাটা নষ্ট না হওয়ার কৌশল:</span>
                            </div>
                            
                            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>১-ক্লিকে ফুল ব্যাকআপ:</strong> ওপরের বোতাম থেকে <code>.zip</code> ফাইল ডাউনলোড করে আপনার ড্রাইভে সেভ রাখুন।</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>নতুন ডেভেলপমেন্টে মাইগ্রেশন ব্যবহার:</strong> সাইট যখন নতুন ডেভেলপ করবেন, তখন নতুন টেবিল বা কলাম মাইগ্রেশন (<code>php artisan make:migration</code>) দিয়ে তৈরি করবেন।</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span><strong>অটো-আপডেট রিস্টোর:</strong> পরবর্তীতে যখনই এই ব্যাকআপ রিস্টোর করবেন, সিস্টেম নিজে নিজে নতুন মাইগ্রেশনগুলো সক্রিয় করে নিবে; ফলে নতুন কোনো ফিচার কখনোই ভাঙবে না!</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>

            </div>
        </>
    );
}
