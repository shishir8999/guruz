import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    UploadCloud, 
    Download, 
    FileSpreadsheet, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    RefreshCw,
    FileText,
    HelpCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function ImportCsv() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/seller/import/template';
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            Swal.fire({
                title: 'No File Selected!',
                text: 'Please select or drag a CSV or Excel file to upload.',
                icon: 'warning',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append('csv_file', file);

        router.post('/seller/import', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUploading(false);
                setFile(null);
                Swal.fire({
                    title: 'Products Imported! 🎉',
                    text: 'আপনার প্রোডাক্টগুলো শপ ইনভেন্টরিতে ইম্পোর্ট হয়ে গেছে। প্রোডাক্টের তালিকা দেখতে "View Product List" এ ক্লিক করুন।',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: '📦 View Product List',
                    cancelButtonText: 'Add More Products',
                    confirmButtonColor: '#10b981',
                    cancelButtonColor: '#6b7280',
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.visit('/seller/products');
                    }
                });
            },
            onError: (errs) => {
                setIsUploading(false);
                const firstErr = Object.values(errs)[0] || 'Failed to import CSV file.';
                Swal.fire({
                    title: 'Import Failed!',
                    text: String(firstErr),
                    icon: 'error',
                    confirmButtonColor: '#ef4444',
                });
            }
        });
    };

    return (
        <>
            <Head title="Import Product by CSV — Inventory Bulk Upload" />

            <div className="max-w-5xl mx-auto space-y-6 pb-20">

                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md mb-2">
                            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                            Bulk Inventory Import Engine
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Import product by CSV</h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                            একসাথে শত শত প্রোডাক্ট CSV বা Excel ফাইলের মাধ্যমে আপনার শপ ইনভেন্টরিতে ইম্পোর্ট করুন।
                        </p>
                    </div>

                    <button 
                        onClick={handleDownloadTemplate}
                        className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 backdrop-blur-md"
                    >
                        <Download className="w-4 h-4 text-emerald-400" /> Download Sample CSV Template
                    </button>
                </div>

                {/* Import Main Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

                    {/* Drag & Drop Upload Zone */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative w-full min-h-[220px] rounded-3xl flex flex-col items-center justify-center text-center transition-all border-2 border-dashed p-6 cursor-pointer group
                            ${dragActive ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-emerald-500 hover:bg-emerald-50/30'}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            accept=".csv, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .xlsx, .xls, .txt" 
                            className="hidden"
                            onChange={handleChange}
                        />
                        
                        {!file ? (
                            <div className="space-y-3 pointer-events-none">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-200 dark:border-indigo-800 shadow-xs group-hover:scale-110 transition-transform">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                                        Upload from computer or drag & drop file here
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                        Supported Formats: CSV, XLSX, XLS — Max File Size: 10MB
                                    </p>
                                </div>
                                <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs group-hover:bg-indigo-500 transition">
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> Select File From Computer
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-xs">
                                    <FileSpreadsheet className="w-7 h-7" />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2 justify-center">
                                        {file.name}
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-slate-400 hover:text-rose-500 p-1"
                                            title="Remove File"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </h4>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                        ✓ Ready to import • {(file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <p className="text-[11px] text-slate-400">অন্য ফাইল সিলেক্ট করতে বক্সটিতে আবার ক্লিক করুন</p>
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button 
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="w-full sm:w-auto px-6 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Download className="w-4 h-4" /> Download Sample CSV Template
                        </button>

                        <button 
                            type="button"
                            onClick={handleUploadSubmit}
                            disabled={!file || isUploading}
                            className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-400 rounded-2xl transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isUploading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" /> Importing Products...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-4 h-4" /> Upload & Import File
                                </>
                            )}
                        </button>
                    </div>

                </div>

                {/* CSV Format Helper Guide Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-indigo-600" /> Standard CSV Format & Header Specification
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">Product Name</th>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3">Price (BDT)</th>
                                    <th className="p-3">Sale Price</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Brand</th>
                                    <th className="p-3">Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                                <tr>
                                    <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">Spark Cable 1.5RM</td>
                                    <td className="p-3 text-indigo-600">SPK-15RM</td>
                                    <td className="p-3">4500.00</td>
                                    <td className="p-3">4200.00</td>
                                    <td className="p-3 font-bold text-emerald-600">150</td>
                                    <td className="p-3 font-sans">Electronics</td>
                                    <td className="p-3 font-sans">Spark</td>
                                    <td className="p-3 font-sans">Coil</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">Guruz Socket 5M</td>
                                    <td className="p-3 text-indigo-600">GRZ-5M</td>
                                    <td className="p-3">1200.00</td>
                                    <td className="p-3">990.00</td>
                                    <td className="p-3 font-bold text-emerald-600">80</td>
                                    <td className="p-3 font-sans">Appliances</td>
                                    <td className="p-3 font-sans">Guruz</td>
                                    <td className="p-3 font-sans">Pcs</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </>
    );
}

ImportCsv.layout = (page: any) => <SellerLayout children={page} />;
