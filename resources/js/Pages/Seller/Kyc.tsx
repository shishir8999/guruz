import React, { useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Shield, CheckCircle2, Upload, AlertTriangle, FileText, Fingerprint, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Kyc({ kyc }: any) {
    const nidFrontRef = useRef<HTMLInputElement>(null);
    const nidBackRef = useRef<HTMLInputElement>(null);
    const tradeLicenseRef = useRef<HTMLInputElement>(null);
    const bankStatementRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        nid_number: kyc?.nid_number || '',
        trade_license_number: kyc?.trade_license_number || '',
        nid_front: null as File | null,
        nid_back: null as File | null,
        trade_license: null as File | null,
        bank_statement: null as File | null,
    });

    const isVerified = kyc?.status === 'verified' || kyc?.status === 'Verified' || kyc?.status === 'approved' || kyc?.status === 'Approved';
    const isPending = kyc?.status === 'pending' || kyc?.status === 'Pending';
    const isRejected = kyc?.status === 'rejected' || kyc?.status === 'Rejected';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.nid_number || !data.nid_number.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'NID নম্বর আবশ্যক',
                text: 'অনুগ্রহ করে আপনার জাতীয় পরিচয়পত্র (NID) নম্বর দিন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        if (!kyc?.nid_front_image && !data.nid_front) {
            Swal.fire({
                icon: 'warning',
                title: 'NID Front ছবি আপলোড করুন',
                text: 'অনুগ্রহ করে আপনার জাতীয় পরিচয়পত্রের সামনের অংশের ছবি (NID Front) সিলেক্ট করুন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        if (!kyc?.nid_back_image && !data.nid_back) {
            Swal.fire({
                icon: 'warning',
                title: 'NID Back ছবি আপলোড করুন',
                text: 'অনুগ্রহ করে আপনার জাতীয় পরিচয়পত্রের পেছনের অংশের ছবি (NID Back) সিলেক্ট করুন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        post('/seller/kyc', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'KYC Submitted Successfully!',
                    html: '<div class="text-sm text-slate-600 mt-2"><p class="font-bold text-slate-800">আপনার কেওয়াইসি (KYC) ও ভেরিফিকেশন তথ্য সফলভাবে সাবমিট হয়েছে!</p><p class="mt-1">অ্যাডমিন টিম দ্রুত আপনার দেওয়া ডকুমেন্টগুলো যাচাই করে অ্যাকাউন্টটি ভেরিফাই করবে।</p></div>',
                    confirmButtonText: 'ঠিক আছে (OK)',
                    confirmButtonColor: '#4f46e5',
                });
            },
            onError: (errs) => {
                const errorMessages = Object.values(errs).flat().join('<br/>') || 'সাবমিট করতে সমস্যা হয়েছে। দয়া করে তথ্য ও ছবি সঠিকভাবে দিন।';
                Swal.fire({
                    icon: 'error',
                    title: 'সাবমিট ব্যর্থ হয়েছে!',
                    html: `<div class="text-sm text-red-600 mt-2">${errorMessages}</div>`,
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#ef4444',
                });
            }
        });
    };

    return (
        <>
            <Head title="Identity Verification" />

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Shield className="w-6 h-6" />
                            </div>
                            KYC & Business Verification
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 ml-14">Verify your identity and business to unlock all seller features.</p>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-14 md:ml-0 flex-shrink-0">
                        {isVerified ? (
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-[#16a34a] text-white rounded-xl font-bold shadow-md shadow-emerald-200 animate-in fade-in duration-300">
                                <CheckCircle2 className="w-5 h-5" /> Verified
                            </div>
                        ) : isPending ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-md shadow-amber-200">
                                <Search className="w-5 h-5 animate-pulse" /> Under Review
                            </div>
                        ) : isRejected ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-bold shadow-md shadow-red-200">
                                <AlertTriangle className="w-5 h-5" /> Verification Failed
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200">
                                <Shield className="w-5 h-5 text-slate-400" /> Unverified
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Info Sidebar */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" /> Required Documents
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5"><Fingerprint className="w-4 h-4 text-slate-400" /></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-700">National ID Card</div>
                                        <div className="text-xs text-slate-500">For personal identity verification</div>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5"><FileText className="w-4 h-4 text-slate-400" /></div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-700">Trade License</div>
                                        <div className="text-xs text-slate-500">Required for business accounts (Optional for individuals)</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <form onSubmit={submit} className="space-y-6">
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Fingerprint className="w-4 h-4 text-slate-400" /> NID Number *
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.nid_number} 
                                            onChange={e => setData('nid_number', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
                                            placeholder="Enter your National ID Number"
                                            disabled={isVerified}
                                            required
                                        />
                                        {errors.nid_number && <p className="text-red-500 text-xs mt-1">{errors.nid_number}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-slate-400" /> Trade License Number
                                        </label>
                                        <input 
                                            type="text" 
                                            value={data.trade_license_number} 
                                            onChange={e => setData('trade_license_number', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
                                            placeholder="Leave blank if you don't have one"
                                            disabled={isVerified}
                                        />
                                        {errors.trade_license_number && <p className="text-red-500 text-xs mt-1">{errors.trade_license_number}</p>}
                                    </div>

                                    {/* Upload Document Areas */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* NID Front */}
                                        <div 
                                            onClick={() => !isVerified && nidFrontRef.current?.click()}
                                            className={`border-2 border-dashed ${
                                                data.nid_front ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                                            } rounded-2xl p-6 text-center transition cursor-pointer relative overflow-hidden`}
                                        >
                                            {data.nid_front ? (
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={URL.createObjectURL(data.nid_front)}
                                                        alt="NID Front Preview"
                                                        className="h-16 w-28 object-cover rounded-lg mb-1.5 border border-emerald-300 shadow-xs"
                                                    />
                                                    <div className="text-xs font-bold text-emerald-700 truncate max-w-[180px]">{data.nid_front.name}</div>
                                                    <div className="text-[10px] text-emerald-600 mt-0.5 font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ready to submit
                                                    </div>
                                                </div>
                                            ) : kyc?.nid_front_image ? (
                                                <div className="flex flex-col items-center">
                                                    <img src={kyc.nid_front_image} alt="NID Front" className="h-16 w-28 object-cover rounded-lg mb-1.5 border border-slate-200 shadow-xs" />
                                                    <div className="text-xs font-bold text-emerald-600">NID Front Uploaded</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">ক্লিক করে নতুন ছবি দিতে পারেন</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                                    <div className="text-sm font-semibold text-slate-700">Upload NID Front</div>
                                                    <div className="text-xs text-slate-400 mt-1">JPG, PNG (Max 10MB)</div>
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={nidFrontRef} 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={e => e.target.files && setData('nid_front', e.target.files[0])} 
                                            />
                                        </div>

                                        {/* NID Back */}
                                        <div 
                                            onClick={() => !isVerified && nidBackRef.current?.click()}
                                            className={`border-2 border-dashed ${
                                                data.nid_back ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                                            } rounded-2xl p-6 text-center transition cursor-pointer relative overflow-hidden`}
                                        >
                                            {data.nid_back ? (
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={URL.createObjectURL(data.nid_back)}
                                                        alt="NID Back Preview"
                                                        className="h-16 w-28 object-cover rounded-lg mb-1.5 border border-emerald-300 shadow-xs"
                                                    />
                                                    <div className="text-xs font-bold text-emerald-700 truncate max-w-[180px]">{data.nid_back.name}</div>
                                                    <div className="text-[10px] text-emerald-600 mt-0.5 font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ready to submit
                                                    </div>
                                                </div>
                                            ) : kyc?.nid_back_image ? (
                                                <div className="flex flex-col items-center">
                                                    <img src={kyc.nid_back_image} alt="NID Back" className="h-16 w-28 object-cover rounded-lg mb-1.5 border border-slate-200 shadow-xs" />
                                                    <div className="text-xs font-bold text-emerald-600">NID Back Uploaded</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">ক্লিক করে নতুন ছবি দিতে পারেন</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                                    <div className="text-sm font-semibold text-slate-700">Upload NID Back</div>
                                                    <div className="text-xs text-slate-400 mt-1">JPG, PNG (Max 10MB)</div>
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={nidBackRef} 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={e => e.target.files && setData('nid_back', e.target.files[0])} 
                                            />
                                        </div>

                                        {/* Trade License (Optional) */}
                                        <div 
                                            onClick={() => !isVerified && tradeLicenseRef.current?.click()}
                                            className={`border-2 border-dashed ${
                                                data.trade_license ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                                            } rounded-2xl p-6 text-center transition cursor-pointer relative overflow-hidden`}
                                        >
                                            {data.trade_license ? (
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={URL.createObjectURL(data.trade_license)}
                                                        alt="Trade License Preview"
                                                        className="h-16 w-28 object-cover rounded-lg mb-1.5 border border-emerald-300 shadow-xs"
                                                    />
                                                    <div className="text-xs font-bold text-emerald-700 truncate max-w-[180px]">{data.trade_license.name}</div>
                                                    <div className="text-[10px] text-emerald-600 mt-0.5 font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ready to submit
                                                    </div>
                                                </div>
                                            ) : kyc?.trade_license_image ? (
                                                <div className="flex flex-col items-center">
                                                    <img src={kyc.trade_license_image} alt="Trade License" className="h-16 w-28 object-cover rounded-lg mb-1.5 border border-slate-200 shadow-xs" />
                                                    <div className="text-xs font-bold text-emerald-600">Trade License Uploaded</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">ক্লিক করে নতুন ছবি দিতে পারেন</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                                    <div className="text-sm font-semibold text-slate-700">Upload Trade License</div>
                                                    <div className="text-xs text-slate-400 mt-1">ঐচ্ছিক (JPG, PNG, PDF Max 10MB)</div>
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={tradeLicenseRef} 
                                                className="hidden" 
                                                accept="image/*,application/pdf" 
                                                onChange={e => e.target.files && setData('trade_license', e.target.files[0])} 
                                            />
                                        </div>

                                        {/* Bank Statement (Optional) */}
                                        <div 
                                            onClick={() => !isVerified && bankStatementRef.current?.click()}
                                            className={`border-2 border-dashed ${
                                                data.bank_statement ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                                            } rounded-2xl p-6 text-center transition cursor-pointer relative overflow-hidden`}
                                        >
                                            {data.bank_statement ? (
                                                <div className="flex flex-col items-center">
                                                    <img
                                                        src={URL.createObjectURL(data.bank_statement)}
                                                        alt="Bank Statement Preview"
                                                        className="h-16 w-28 object-cover rounded-lg mb-1.5 border border-emerald-300 shadow-xs"
                                                    />
                                                    <div className="text-xs font-bold text-emerald-700 truncate max-w-[180px]">{data.bank_statement.name}</div>
                                                    <div className="text-[10px] text-emerald-600 mt-0.5 font-bold flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ready to submit
                                                    </div>
                                                </div>
                                            ) : kyc?.bank_statement_image ? (
                                                <div className="flex flex-col items-center">
                                                    <img src={kyc.bank_statement_image} alt="Bank Statement" className="h-16 w-28 object-cover rounded-lg mb-1.5 border border-slate-200 shadow-xs" />
                                                    <div className="text-xs font-bold text-emerald-600">Bank Statement Uploaded</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">ক্লিক করে নতুন ছবি দিতে পারেন</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                                    <div className="text-sm font-semibold text-slate-700">Upload Bank Statement</div>
                                                    <div className="text-xs text-slate-400 mt-1">ঐচ্ছিক (JPG, PNG, PDF Max 10MB)</div>
                                                </>
                                            )}
                                            <input 
                                                type="file" 
                                                ref={bankStatementRef} 
                                                className="hidden" 
                                                accept="image/*,application/pdf" 
                                                onChange={e => e.target.files && setData('bank_statement', e.target.files[0])} 
                                            />
                                        </div>
                                    </div>

                                    {!isVerified && (
                                        <div className="pt-4 border-t border-slate-100">
                                            <button 
                                                type="submit"
                                                disabled={processing}
                                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-70 shadow-sm shadow-indigo-200 cursor-pointer"
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                                        <span>Submitting for Verification...</span>
                                                    </>
                                                ) : (
                                                    <span>Submit for Verification</span>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
