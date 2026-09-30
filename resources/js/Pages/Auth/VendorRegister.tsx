import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Store, User, Mail, Phone, MapPin, Lock, ChevronRight, ChevronLeft, Eye, EyeOff, Building2, CreditCard, ShieldCheck, CheckCircle2, Package, X, Clock, Rocket, Upload, Camera, FileText, Trash2, Shield, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';

export default function VendorRegister() {
    const { props } = usePage<any>();
    const siteLogo = props.siteSettings?.site_logo || props.cms?.logo_url;

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successDetails, setSuccessDetails] = useState<{
        user_name?: string;
        shop_name?: string;
        shop_phone?: string;
    } | null>(null);

    const nidFrontRef = useRef<HTMLInputElement>(null);
    const nidBackRef = useRef<HTMLInputElement>(null);
    const tradeLicenseRef = useRef<HTMLInputElement>(null);
    const bankStatementRef = useRef<HTMLInputElement>(null);
    const lastValidationErrorRef = useRef<string>('');

    // Pre-fill email/phone from URL parameters if available
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlEmail = params.get('email');
        const urlPhone = params.get('phone');
        if (urlEmail) setData('email', urlEmail);
        if (urlPhone) setData('shop_phone', urlPhone);
    }, []);

    // Watch for flash messages (e.g. backend error or success popup)
    useEffect(() => {
        const flashData = props?.flash as any;
        if (flashData?.error) {
            Swal.fire({
                icon: 'error',
                title: 'সমস্যা হয়েছে',
                text: flashData.error,
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#ef4444',
            });
        }
        if (flashData?.vendor_registration_success) {
            setSuccessDetails(flashData.vendor_registration_success);
            setShowSuccessModal(true);
            try {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 },
                });
            } catch (e) {
                // ignore
            }
        }
    }, [props?.flash]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        shop_name: '',
        shop_phone: '',
        shop_address: '',
        shop_description: '',
        bank_name: '',
        account_number: '',
        nid_number: '',
        nid_front: null as File | null,
        nid_back: null as File | null,
        trade_license: null as File | null,
        bank_statement: null as File | null,
    });

    const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,24}$/;
    const phoneRegex = /^01[3-9]\d{8}$/;

    const updateField = (field: string, value: any) => {
        setData(field as any, value);
        if (stepErrors[field]) {
            setStepErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let raw = e.target.value;
        let cleaned = raw.replace(/[^0-9]/g, '');
        if (cleaned.startsWith('8801') && cleaned.length > 11) {
            cleaned = cleaned.substring(2);
        }
        // If user typed 10 digits starting with 13-19 without leading 0, auto-prefix 0
        if (cleaned.length === 10 && /^[1-9]/.test(cleaned) && !cleaned.startsWith('0')) {
            cleaned = '0' + cleaned;
        }
        cleaned = cleaned.slice(0, 11);
        updateField('shop_phone', cleaned);
    };

    const handleFileChange = (field: 'nid_front' | 'nid_back' | 'trade_license' | 'bank_statement', file: File | null) => {
        if (!file) {
            updateField(field, null);
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setStepErrors(prev => ({
                ...prev,
                [field]: 'ফাইলের সাইজ সর্বোচ্চ ২০ মেগাবাইট (20MB) হতে পারবে।'
            }));
            return;
        }
        updateField(field, file);
    };

    const isImageFile = (file: File) => {
        return Boolean((file.type && file.type.startsWith('image/')) || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name));
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const validateStep = (s: number): boolean => {
        const errs: Record<string, string> = {};

        if (s === 1) {
            if (!data.name?.trim()) {
                errs.name = 'আপনার পূর্ণ নাম লিখুন।';
            } else if (data.name.trim().length < 2) {
                errs.name = 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।';
            }

            if (!data.email?.trim()) {
                errs.email = 'ইমেইল অ্যাড্রেস দেওয়া আবশ্যক।';
            } else if (!emailRegex.test(data.email.trim())) {
                errs.email = 'অনুগ্রহ করে সঠিক ইমেইল এড্রেস লিখুন (যেমন: name@gmail.com)।';
            }

            if (!data.password) {
                errs.password = 'পাসওয়ার্ড দেওয়া আবশ্যক।';
            } else if (data.password.length < 8) {
                errs.password = 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।';
            }

            if (!data.password_confirmation) {
                errs.password_confirmation = 'পাসওয়ার্ড নিশ্চিত করুন।';
            } else if (data.password !== data.password_confirmation) {
                errs.password_confirmation = 'পাসওয়ার্ড দুটি মিলছে না।';
            }
        } else if (s === 2) {
            if (!data.shop_name?.trim()) {
                errs.shop_name = 'শপের নাম লিখুন।';
            } else if (data.shop_name.trim().length < 2) {
                errs.shop_name = 'শপের নাম কমপক্ষে ২ অক্ষরের হতে হবে।';
            }

            if (!data.shop_phone?.trim()) {
                errs.shop_phone = 'শপের অফিশিয়াল মোবাইল নম্বর দেওয়া আবশ্যক।';
            } else if (data.shop_phone.length < 11) {
                errs.shop_phone = `মোবাইল নম্বরটি ১১ ডিজিট হতে হবে (বর্তমানে ${data.shop_phone.length} ডিজিট রয়েছে)। যেমন: 01712345678`;
            } else if (!phoneRegex.test(data.shop_phone)) {
                errs.shop_phone = 'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)।';
            }

            if (!data.shop_address?.trim()) {
                errs.shop_address = 'শপ / বিজনেসের পূর্ণ ঠিকানা লিখুন।';
            } else if (data.shop_address.trim().length < 4) {
                errs.shop_address = 'ঠিকানা বিস্তারিত লিখুন (কমপক্ষে ৪ অক্ষর)।';
            }
        } else if (s === 3) {
            if (!data.bank_name?.trim()) {
                errs.bank_name = 'ব্যাংক অথবা মোবাইল ব্যাংকিং নাম লিখুন।';
            }
            if (!data.account_number?.trim()) {
                errs.account_number = 'একাউন্ট নম্বর / পার্সোনাল নম্বর লিখুন।';
            }
            if (!data.nid_front) {
                errs.nid_front = 'জাতীয় পরিচয়পত্রের সামনের অংশের (NID Front) ছবি আপলোড করুন।';
            }
            if (!data.nid_back) {
                errs.nid_back = 'জাতীয় পরিচয়পত্রের পেছনের অংশের (NID Back) ছবি আপলোড করুন।';
            }
        }

        setStepErrors(errs);
        lastValidationErrorRef.current = Object.values(errs)[0] || '';
        return Object.keys(errs).length === 0;
    };

    const handleNextStep = () => {
        if (!validateStep(step)) {
            Swal.fire({
                icon: 'warning',
                title: 'তথ্য অসম্পূর্ণ',
                text: lastValidationErrorRef.current || 'অনুগ্রহ করে বর্তমান ধাপের প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }
        setStepErrors({});
        setStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrevStep = () => {
        setStepErrors({});
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleStepClick = (targetStep: number) => {
        if (targetStep === step) return;
        if (targetStep < step) {
            setStepErrors({});
            setStep(targetStep);
            return;
        }
        // If clicking ahead, validate current step first
        if (!validateStep(step)) {
            Swal.fire({
                icon: 'warning',
                title: 'তথ্য অসম্পূর্ণ',
                text: lastValidationErrorRef.current || 'অনুগ্রহ করে বর্তমান ধাপের প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }
        setStepErrors({});
        setStep(targetStep);
    };

    const submit = (e?: React.FormEvent | React.MouseEvent) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        if (!validateStep(1)) {
            setStep(1);
            Swal.fire({
                icon: 'warning',
                title: 'ব্যক্তিগত তথ্য অসম্পূর্ণ',
                text: lastValidationErrorRef.current || 'অনুগ্রহ করে স্টেপ ১-এর সকল তথ্য সঠিকভাবে পূরণ করুন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }
        if (!validateStep(2)) {
            setStep(2);
            Swal.fire({
                icon: 'warning',
                title: 'শপের তথ্য অসম্পূর্ণ',
                text: lastValidationErrorRef.current || 'অনুগ্রহ করে স্টেপ ২-এর শপের নাম, ফোন ও ঠিকানা সঠিকভাবে পূরণ করুন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }
        if (!validateStep(3)) {
            Swal.fire({
                icon: 'warning',
                title: 'পেমেন্ট ও ডকুমেন্ট তথ্য অসম্পূর্ণ',
                text: lastValidationErrorRef.current || 'অনুগ্রহ করে ব্যাংক তথ্য ও জাতীয় পরিচয়পত্রের (NID) সামনের ও পেছনের ছবি আপলোড করুন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#4f46e5',
            });
            return;
        }

        setSuccessDetails({
            user_name: data.name,
            shop_name: data.shop_name,
            shop_phone: data.shop_phone,
        });

        post('/vendor/register', {
            forceFormData: true,
            preserveScroll: true,
            onError: (backendErrors) => {
                const errValues = Object.values(backendErrors);
                const errorMsg = errValues.length > 0 ? errValues.join('\n') : 'ফর্মের তথ্যে কিছু ভুল পাওয়া গেছে।';

                Swal.fire({
                    icon: 'error',
                    title: 'রেজিস্ট্রেশন সম্পন্ন হয়নি',
                    text: errorMsg,
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#ef4444',
                });

                if (backendErrors.name || backendErrors.email || backendErrors.password) {
                    setStep(1);
                } else if (backendErrors.shop_name || backendErrors.shop_phone || backendErrors.shop_address) {
                    setStep(2);
                } else {
                    setStep(3);
                }
            },
            onSuccess: (page) => {
                const flashData = page.props?.flash as any;
                if (flashData?.vendor_registration_success) {
                    setSuccessDetails(flashData.vendor_registration_success);
                } else {
                    setSuccessDetails({
                        user_name: data.name,
                        shop_name: data.shop_name,
                        shop_phone: data.shop_phone,
                    });
                }
                setShowSuccessModal(true);
                try {
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 }
                    });
                } catch (e) {
                    // Ignore confetti error
                }
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 md:p-8">
            <Head title="সেলার রেজিস্ট্রেশন — Guruz" />

            <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
                
                {/* LEFT SIDE - Info Panel */}
                <div className="w-full md:w-2/5 bg-gradient-to-b from-indigo-700 via-indigo-800 to-indigo-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                        <Link href="/vendor" className="flex items-center gap-2.5 mb-10 opacity-90 hover:opacity-100 transition">
                            {siteLogo ? (
                                <img src={siteLogo} alt="Logo" className="max-h-9 object-contain" />
                            ) : (
                                <>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-base shadow border border-white/20">
                                        g
                                    </div>
                                    <span className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                                        guruz <span className="text-amber-300 text-xs font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full border border-white/20">vendor</span>
                                    </span>
                                </>
                            )}
                        </Link>
                        
                        <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                            আপনার ব্যবসা বাড়ান <span className="text-amber-300">Guruz</span> এর সাথে
                        </h1>
                        
                        <p className="text-indigo-100 mb-8 text-sm leading-relaxed">
                            ধাপে ধাপে আপনার ও ব্যবসার তথ্য দিন। রেজিস্ট্রেশন জমা দিলে সুপার অ্যাডমিন রিভিউ করে আপনার শপ অ্যাক্টিভ করে দেবে।
                        </p>

                        {/* Step Progress Indicators */}
                        <div className="space-y-3 my-6">
                            {[
                                { s: 1, title: '১. একাউন্ট তথ্য', desc: 'নাম, ইমেইল ও পাসওয়ার্ড' },
                                { s: 2, title: '২. শপের তথ্য', desc: 'শপের নাম, মোবাইল ও ঠিকানা' },
                                { s: 3, title: '৩. ব্যাংক ও ভেরিফিকেশন', desc: 'NID কার্ড ও ব্যাংক একাউন্ট' }
                            ].map((st) => (
                                <button
                                    key={st.s}
                                    type="button"
                                    onClick={() => handleStepClick(st.s)}
                                    className={`w-full text-left flex items-center gap-3 p-3.5 rounded-2xl transition-all cursor-pointer ${
                                        step === st.s
                                            ? 'bg-white/25 border-2 border-white/50 backdrop-blur-md shadow-md ring-2 ring-amber-400/40'
                                            : 'bg-white/5 hover:bg-white/15 border border-white/10 opacity-75 hover:opacity-100'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                        step === st.s
                                            ? 'bg-amber-400 text-slate-900 shadow-md scale-110 font-black'
                                            : step > st.s
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white/20 text-white'
                                    }`}>
                                        {step > st.s ? <CheckCircle2 className="w-5 h-5 text-white" /> : st.s}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-xs text-white">{st.title}</h4>
                                            {step > st.s && (
                                                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
                                                    সম্পন্ন ✓
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-indigo-200 truncate">{st.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-indigo-200 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>১০০% নিরাপদ সেলার অনবোর্ডিং প্ল্যাটফর্ম</span>
                    </div>
                </div>

                {/* RIGHT SIDE - Multi-step Wizard Form */}
                <div className="w-full md:w-3/5 p-8 md:p-12 max-h-[90vh] overflow-y-auto">
                    
                    <div className="mb-6 flex items-center justify-between border-b pb-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">সেলার রেজিস্ট্রেশন ফরম</h2>
                            <p className="text-xs text-slate-500 font-medium">ধাপ {step} এর ৩</p>
                        </div>

                        {/* Step Dots (Clickable) */}
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleStepClick(i)}
                                    title={`ধাপ ${i}`}
                                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        step === i
                                            ? 'w-8 bg-indigo-600 shadow'
                                            : step > i
                                                ? 'w-3 bg-emerald-500 hover:bg-emerald-600'
                                                : 'w-3 bg-slate-200 hover:bg-slate-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Step Validation Alert Banner */}
                    {Object.keys(stepErrors).length > 0 && (
                        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                            <span className="text-base shrink-0">⚠️</span>
                            <span>পরবর্তী ধাপে যেতে নিচের লাল চিহ্নিত ঘরগুলো সঠিকভাবে পূরণ করুন।</span>
                        </div>
                    )}

                    <form onSubmit={submit} noValidate className="space-y-6">

                        {/* ─── STEP 1: Account Details ─── */}
                        {step === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-4 h-4" /> ১. ব্যক্তিগত একাউন্ট তথ্য
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">আপনার পূর্ণ নাম *</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => updateField('name', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                            (stepErrors.name || errors.name)
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-slate-200 focus:ring-indigo-500'
                                        }`}
                                        placeholder="আপনার পূর্ণ নাম"
                                        required 
                                    />
                                    {(stepErrors.name || errors.name) && (
                                        <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                            <span>⚠</span> {stepErrors.name || errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">ইমেইল এড্রেস *</label>
                                    <input 
                                        type="email" 
                                        value={data.email}
                                        onChange={e => updateField('email', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                            (stepErrors.email || errors.email)
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-slate-200 focus:ring-indigo-500'
                                        }`}
                                        placeholder="yourname@gmail.com"
                                        required 
                                    />
                                    {(stepErrors.email || errors.email) && (
                                        <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                            <span>⚠</span> {stepErrors.email || errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড *</label>
                                        <div className="relative">
                                            <input 
                                                type={showPassword ? "text" : "password"} 
                                                value={data.password}
                                                onChange={e => updateField('password', e.target.value)}
                                                className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                                    (stepErrors.password || errors.password)
                                                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                        : 'border-slate-200 focus:ring-indigo-500'
                                                }`}
                                                placeholder="নূন্যতম ৮ অক্ষরের পাসওয়ার্ড"
                                                required 
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowPassword(prev => !prev);
                                                }}
                                                onMouseDown={(e) => e.preventDefault()}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer focus:outline-none"
                                                title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                                                aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <EyeOff size={18} className="pointer-events-none" /> : <Eye size={18} className="pointer-events-none" />}
                                            </button>
                                        </div>
                                        {(stepErrors.password || errors.password) && (
                                            <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                                <span>⚠</span> {stepErrors.password || errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন *</label>
                                        <div className="relative">
                                            <input 
                                                type={showConfirmPassword ? "text" : "password"} 
                                                value={data.password_confirmation}
                                                onChange={e => updateField('password_confirmation', e.target.value)}
                                                className={`w-full px-4 py-3 pr-11 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                                    (stepErrors.password_confirmation || errors.password_confirmation)
                                                        ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                        : 'border-slate-200 focus:ring-indigo-500'
                                                }`}
                                                placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                                                required 
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowConfirmPassword(prev => !prev);
                                                }}
                                                onMouseDown={(e) => e.preventDefault()}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer focus:outline-none"
                                                title={showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                                                aria-label={showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} className="pointer-events-none" /> : <Eye size={18} className="pointer-events-none" />}
                                            </button>
                                        </div>
                                        {(stepErrors.password_confirmation || errors.password_confirmation) && (
                                            <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                                <span>⚠</span> {stepErrors.password_confirmation || errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 2: Shop Details ─── */}
                        {step === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                    <Store className="w-4 h-4" /> ২. শপ ও বিজনেসের তথ্য
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">শপের নাম (Shop Name) *</label>
                                    <input 
                                        type="text" 
                                        value={data.shop_name}
                                        onChange={e => updateField('shop_name', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                            (stepErrors.shop_name || errors.shop_name)
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-slate-200 focus:ring-indigo-500'
                                        }`}
                                        placeholder="যেমন: স্পার্ক ফ্যাশন শপ"
                                        required 
                                    />
                                    {(stepErrors.shop_name || errors.shop_name) && (
                                        <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                            <span>⚠</span> {stepErrors.shop_name || errors.shop_name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold text-slate-700">শপের অফিশিয়াল মোবাইল নম্বর *</label>
                                        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded transition ${
                                            data.shop_phone.length === 11
                                                ? 'text-emerald-700 bg-emerald-100 border border-emerald-300'
                                                : data.shop_phone.length > 0
                                                    ? 'text-amber-700 bg-amber-100 border border-amber-300'
                                                    : 'text-slate-500 bg-slate-100'
                                        }`}>
                                            {data.shop_phone.length === 11 ? '✓ ১১/১১ ডিজিট' : `${data.shop_phone.length}/১১ ডিজিট`}
                                        </span>
                                    </div>
                                    <input 
                                        type="tel" 
                                        inputMode="numeric"
                                        maxLength={11}
                                        value={data.shop_phone}
                                        onChange={handlePhoneChange}
                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                            (stepErrors.shop_phone || errors.shop_phone)
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-slate-200 focus:ring-indigo-500'
                                        }`}
                                        placeholder="01712345678"
                                        required 
                                    />
                                    {(stepErrors.shop_phone || errors.shop_phone) ? (
                                        <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                            <span>⚠</span> {stepErrors.shop_phone || errors.shop_phone}
                                        </p>
                                    ) : (
                                        <p className="text-slate-400 text-[11px] mt-1">
                                            ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 01812345678)
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">শপ / বিজনেসের পূর্ণ ঠিকানা *</label>
                                    <textarea 
                                        value={data.shop_address}
                                        onChange={e => updateField('shop_address', e.target.value)}
                                        rows={2}
                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                            (stepErrors.shop_address || errors.shop_address)
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-slate-200 focus:ring-indigo-500'
                                        }`}
                                        placeholder="দোকান নং, মার্কেট/রোড, এলাকা, জেলা"
                                        required
                                    ></textarea>
                                    {(stepErrors.shop_address || errors.shop_address) && (
                                        <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                            <span>⚠</span> {stepErrors.shop_address || errors.shop_address}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">শপ বিবরণ (Shop Description - ঐচ্ছিক)</label>
                                    <textarea 
                                        value={data.shop_description}
                                        onChange={e => updateField('shop_description', e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-slate-800 transition"
                                        placeholder="আপনি কী ধরণের পণ্য বিক্রি করেন? (যেমন: পোশাক, গ্যাজেট, হস্তশিল্প ইত্যাদি)"
                                    ></textarea>
                                </div>
                            </div>
                        )}

                        {/* ─── STEP 3: Payment & KYC Verification ─── */}
                        {step === 3 && (
                            <div className="space-y-4 animate-fade-in">
                                <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" /> ৩. ব্যাংক ও পরিচয়পত্র (KYC) ভেরিফিকেশন *
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">জাতীয় পরিচয়পত্র নম্বর (NID Number - ঐচ্ছিক)</label>
                                    <input 
                                        type="text" 
                                        value={data.nid_number}
                                        onChange={e => updateField('nid_number', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                            (stepErrors.nid_number || errors.nid_number)
                                                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                : 'border-slate-200 focus:ring-indigo-500'
                                        }`}
                                        placeholder="১০ বা ১৭ ডিজিটের জাতীয় পরিচয়পত্র নম্বর"
                                    />
                                    {(stepErrors.nid_number || errors.nid_number) && (
                                        <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                            <span>⚠</span> {stepErrors.nid_number || errors.nid_number}
                                        </p>
                                    )}
                                </div>

                                {/* NID Upload Cards */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold text-slate-800">
                                            জাতীয় পরিচয়পত্রের কপি (NID Document Upload) <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-slate-400 font-medium">ছবি বা PDF (Max 20MB)</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* NID Front */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                                                    NID সামনের অংশ (Front) <span className="text-rose-500">*</span>
                                                </span>
                                                {data.nid_front && (
                                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> লোড হয়েছে
                                                    </span>
                                                )}
                                            </div>

                                            <label
                                                htmlFor="nid_front_input"
                                                className={`relative min-h-[145px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition overflow-hidden group ${
                                                    (stepErrors.nid_front || errors.nid_front)
                                                        ? 'border-rose-400 bg-rose-50/40 hover:bg-rose-50/60'
                                                        : data.nid_front
                                                            ? 'border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/50'
                                                            : 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:bg-indigo-50/40'
                                                }`}
                                            >
                                                {data.nid_front ? (
                                                    <div className="flex flex-col items-center w-full">
                                                        {isImageFile(data.nid_front) ? (
                                                            <img
                                                                src={URL.createObjectURL(data.nid_front)}
                                                                alt="NID Front"
                                                                className="h-16 w-28 object-contain rounded-lg border border-emerald-200 bg-white mb-2 shadow-xs"
                                                            />
                                                        ) : (
                                                            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 mb-2">
                                                                <FileText className="w-8 h-8 text-rose-600" />
                                                            </div>
                                                        )}
                                                        <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={data.nid_front.name}>
                                                            {data.nid_front.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                            {formatFileSize(data.nid_front.size)}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-2.5">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition shadow-2xs">
                                                                <Camera className="w-3 h-3" /> পরিবর্তন করুন
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleFileChange('nid_front', null);
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition shadow-2xs"
                                                            >
                                                                <Trash2 className="w-3 h-3" /> মুছে ফেলুন
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center py-2">
                                                        <div className="w-10 h-10 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 shadow-2xs group-hover:scale-110 transition">
                                                            <Upload className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-800">
                                                            সামনের ছবি নির্বাচন করুন
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 mt-0.5">
                                                            ক্লিক করুন বা ছবি বেছে নিন
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-sm group-hover:bg-indigo-700 transition">
                                                            <Upload className="w-3.5 h-3.5" /> ছবি আপলোড করুন
                                                        </span>
                                                    </div>
                                                )}

                                                <input
                                                    id="nid_front_input"
                                                    type="file"
                                                    ref={nidFrontRef}
                                                    className="sr-only"
                                                    accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleFileChange('nid_front', e.target.files[0]);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>

                                            {(stepErrors.nid_front || errors.nid_front) && (
                                                <p className="text-rose-600 text-[11px] mt-1.5 font-semibold flex items-center gap-1 animate-in fade-in">
                                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {stepErrors.nid_front || errors.nid_front}
                                                </p>
                                            )}
                                        </div>

                                        {/* NID Back */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                                                    NID পেছনের অংশ (Back) <span className="text-rose-500">*</span>
                                                </span>
                                                {data.nid_back && (
                                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> লোড হয়েছে
                                                    </span>
                                                )}
                                            </div>

                                            <label
                                                htmlFor="nid_back_input"
                                                className={`relative min-h-[145px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition overflow-hidden group ${
                                                    (stepErrors.nid_back || errors.nid_back)
                                                        ? 'border-rose-400 bg-rose-50/40 hover:bg-rose-50/60'
                                                        : data.nid_back
                                                            ? 'border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/50'
                                                            : 'border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:bg-indigo-50/40'
                                                }`}
                                            >
                                                {data.nid_back ? (
                                                    <div className="flex flex-col items-center w-full">
                                                        {isImageFile(data.nid_back) ? (
                                                            <img
                                                                src={URL.createObjectURL(data.nid_back)}
                                                                alt="NID Back"
                                                                className="h-16 w-28 object-contain rounded-lg border border-emerald-200 bg-white mb-2 shadow-xs"
                                                            />
                                                        ) : (
                                                            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 mb-2">
                                                                <FileText className="w-8 h-8 text-rose-600" />
                                                            </div>
                                                        )}
                                                        <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]" title={data.nid_back.name}>
                                                            {data.nid_back.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                            {formatFileSize(data.nid_back.size)}
                                                        </span>
                                                        <div className="flex items-center gap-2 mt-2.5">
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition shadow-2xs">
                                                                <Camera className="w-3 h-3" /> পরিবর্তন করুন
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleFileChange('nid_back', null);
                                                                }}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition shadow-2xs"
                                                            >
                                                                <Trash2 className="w-3 h-3" /> মুছে ফেলুন
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center py-2">
                                                        <div className="w-10 h-10 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 mb-2 shadow-2xs group-hover:scale-110 transition">
                                                            <Upload className="w-5 h-5" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-800">
                                                            পেছনের ছবি নির্বাচন করুন
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 mt-0.5">
                                                            ক্লিক করুন বা ছবি বেছে নিন
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-2.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-sm group-hover:bg-indigo-700 transition">
                                                            <Upload className="w-3.5 h-3.5" /> ছবি আপলোড করুন
                                                        </span>
                                                    </div>
                                                )}

                                                <input
                                                    id="nid_back_input"
                                                    type="file"
                                                    ref={nidBackRef}
                                                    className="sr-only"
                                                    accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                                                    onChange={(e) => {
                                                        if (e.target.files && e.target.files[0]) {
                                                            handleFileChange('nid_back', e.target.files[0]);
                                                        }
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>

                                            {(stepErrors.nid_back || errors.nid_back) && (
                                                <p className="text-rose-600 text-[11px] mt-1.5 font-semibold flex items-center gap-1 animate-in fade-in">
                                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {stepErrors.nid_back || errors.nid_back}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Optional Documents: Trade License & Bank Statement */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    {/* Trade License */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                                ট্রেড লাইসেন্স (ঐচ্ছিক)
                                            </span>
                                            {data.trade_license && (
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> লোড হয়েছে
                                                </span>
                                            )}
                                        </div>

                                        <label
                                            htmlFor="trade_license_input"
                                            className={`relative min-h-[120px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition overflow-hidden group ${
                                                data.trade_license
                                                    ? 'border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/50'
                                                    : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/20'
                                            }`}
                                        >
                                            {data.trade_license ? (
                                                <div className="flex flex-col items-center w-full">
                                                    {isImageFile(data.trade_license) ? (
                                                        <img
                                                            src={URL.createObjectURL(data.trade_license)}
                                                            alt="Trade License"
                                                            className="h-12 w-20 object-contain rounded border border-emerald-200 bg-white mb-1 shadow-xs"
                                                        />
                                                    ) : (
                                                        <FileText className="w-6 h-6 text-rose-600 mb-1" />
                                                    )}
                                                    <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]" title={data.trade_license.name}>
                                                        {data.trade_license.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                        {formatFileSize(data.trade_license.size)}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition shadow-2xs">
                                                            পরিবর্তন
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleFileChange('trade_license', null);
                                                            }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition shadow-2xs"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> মুছুন
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-2">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 mb-1.5 group-hover:text-indigo-600 group-hover:scale-105 transition shadow-2xs">
                                                        <Upload className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">ট্রেড লাইসেন্স আপলোড</span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">ছবি বা PDF (ঐচ্ছিক)</span>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 mt-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold group-hover:border-indigo-300 group-hover:text-indigo-600 transition shadow-2xs">
                                                        <Upload className="w-3 h-3" /> ফাইল নির্বাচন করুন
                                                    </span>
                                                </div>
                                            )}

                                            <input
                                                id="trade_license_input"
                                                type="file"
                                                ref={tradeLicenseRef}
                                                className="sr-only"
                                                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleFileChange('trade_license', e.target.files[0]);
                                                    }
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                        {stepErrors.trade_license && (
                                            <p className="text-rose-600 text-[11px] mt-1 font-semibold flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {stepErrors.trade_license}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bank Statement */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                                ব্যাংক চেক / স্টেটমেন্ট (ঐচ্ছিক)
                                            </span>
                                            {data.bank_statement && (
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> লোড হয়েছে
                                                </span>
                                            )}
                                        </div>

                                        <label
                                            htmlFor="bank_statement_input"
                                            className={`relative min-h-[120px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition overflow-hidden group ${
                                                data.bank_statement
                                                    ? 'border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/50'
                                                    : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/20'
                                            }`}
                                        >
                                            {data.bank_statement ? (
                                                <div className="flex flex-col items-center w-full">
                                                    {isImageFile(data.bank_statement) ? (
                                                        <img
                                                            src={URL.createObjectURL(data.bank_statement)}
                                                            alt="Bank Statement"
                                                            className="h-12 w-20 object-contain rounded border border-emerald-200 bg-white mb-1 shadow-xs"
                                                        />
                                                    ) : (
                                                        <FileText className="w-6 h-6 text-rose-600 mb-1" />
                                                    )}
                                                    <span className="text-xs font-bold text-slate-800 truncate max-w-[180px]" title={data.bank_statement.name}>
                                                        {data.bank_statement.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                                        {formatFileSize(data.bank_statement.size)}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition shadow-2xs">
                                                            পরিবর্তন
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleFileChange('bank_statement', null);
                                                            }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-600 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition shadow-2xs"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> মুছুন
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center py-2">
                                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 mb-1.5 group-hover:text-indigo-600 group-hover:scale-105 transition shadow-2xs">
                                                        <Upload className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">চেক পাতা / স্টেটমেন্ট আপলোড</span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">ছবি বা PDF (ঐচ্ছিক)</span>
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 mt-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold group-hover:border-indigo-300 group-hover:text-indigo-600 transition shadow-2xs">
                                                        <Upload className="w-3 h-3" /> ফাইল নির্বাচন করুন
                                                    </span>
                                                </div>
                                            )}

                                            <input
                                                id="bank_statement_input"
                                                type="file"
                                                ref={bankStatementRef}
                                                className="sr-only"
                                                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        handleFileChange('bank_statement', e.target.files[0]);
                                                    }
                                                    e.target.value = '';
                                                }}
                                            />
                                        </label>
                                        {stepErrors.bank_statement && (
                                            <p className="text-rose-600 text-[11px] mt-1 font-semibold flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {stepErrors.bank_statement}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">ব্যাংক বা মোবাইল ব্যাংকিং নাম *</label>
                                        <input 
                                            type="text" 
                                            value={data.bank_name}
                                            onChange={e => updateField('bank_name', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                                (stepErrors.bank_name || errors.bank_name)
                                                    ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                    : 'border-slate-200 focus:ring-indigo-500'
                                            }`}
                                            placeholder="যেমন: bKash / Nagad / DBBL Bank"
                                        />
                                        {(stepErrors.bank_name || errors.bank_name) && (
                                            <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                                <span>⚠</span> {stepErrors.bank_name || errors.bank_name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">একাউন্ট নম্বর / মোবাইল ব্যাংকিং নম্বর *</label>
                                        <input 
                                            type="text" 
                                            value={data.account_number}
                                            onChange={e => updateField('account_number', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 text-xs font-semibold text-slate-800 transition ${
                                                (stepErrors.account_number || errors.account_number)
                                                    ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                                                    : 'border-slate-200 focus:ring-indigo-500'
                                            }`}
                                            placeholder="017XXXXXXXX / একাউন্ট নম্বর"
                                        />
                                        {(stepErrors.account_number || errors.account_number) && (
                                            <p className="text-rose-600 text-xs mt-1 font-semibold flex items-center gap-1 animate-in fade-in">
                                                <span>⚠</span> {stepErrors.account_number || errors.account_number}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 text-xs space-y-1">
                                    <p className="font-bold">⚠️ অনুমোদনের নিয়মাবলী:</p>
                                    <p className="text-[11px] leading-relaxed">
                                        সাবমিট করার পর আপনার সেলার একাউন্ট তৈরি হবে এবং আপনি সেলার প্যানেল দেখতে পারবেন। তবে <strong>সুপার অ্যাডমিন আপনার আপলোডকৃত NID কার্ড যাচাই করে অনুমোদন দেওয়ার পরই শপটি অ্যাক্টিভ হবে</strong>।
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Control Buttons */}
                        <div className="flex items-center justify-between pt-5 border-t gap-3">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span>পূর্ববর্তী ধাপ</span>
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition shadow-md hover:shadow-indigo-500/25 cursor-pointer ml-auto"
                                >
                                    <span>পরবর্তী ধাপ</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={submit}
                                    disabled={processing}
                                    className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-lg hover:shadow-emerald-600/30 disabled:opacity-50 cursor-pointer ml-auto"
                                >
                                    {processing ? (
                                        <>
                                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                            <span>জমা হচ্ছে...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>সেলার রেজিস্ট্রেশন সম্পন্ন করুন</span>
                                            <Rocket className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <p className="text-center text-xs text-slate-500 mt-4">
                            পূর্বেই একাউন্ট রয়েছে? <Link href="/login" className="text-indigo-600 font-bold hover:underline">লগইন করুন</Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* ===== SUCCESSFUL REGISTRATION POPUP / MODAL ===== */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[95vh] flex flex-col border border-emerald-100 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
                        
                        {/* 1. Modal Top Banner */}
                        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 text-white p-6 sm:p-8 text-center relative overflow-hidden shrink-0">
                            <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                            <div className="absolute -left-12 -top-12 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                            
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-200 text-xs font-bold mb-3 border border-white/20 shadow-xs">
                                <span>🎉</span> <span>ভেন্ডর রেজিস্ট্রেশন ও প্যানেল তৈরি সফল</span>
                            </div>

                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl mb-3 relative z-10 animate-bounce">
                                <CheckCircle2 className="w-9 h-9 text-emerald-300" />
                            </div>

                            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug relative z-10">
                                অভিনন্দন! আপনার ভেন্ডর প্যানেল খোলা সম্পন্ন হয়েছে! 🚀
                            </h3>
                            <p className="text-emerald-100 text-xs sm:text-sm mt-2 font-medium relative z-10 max-w-md mx-auto leading-relaxed">
                                Guruz মাল্টিভেন্ডর প্ল্যাটফর্মে আপনার সেলার স্টোর ও ভেন্ডর প্যানেল সফলভাবে উন্মুক্ত করা হয়েছে। এখন থেকেই আপনার ব্যবসা পরিচালনার নতুন অধ্যায় শুরু হলো।
                            </p>

                            {/* Registered Shop Info Summary Card */}
                            {(successDetails?.shop_name || data.shop_name) && (
                                <div className="mt-4 bg-black/25 backdrop-blur-md rounded-2xl p-4 flex items-center justify-around text-left border border-white/15 text-xs relative z-10 shadow-inner">
                                    <div className="min-w-0 pr-2">
                                        <span className="text-emerald-300 block text-[10px] font-bold uppercase tracking-wider">শপের নাম</span>
                                        <span className="font-extrabold text-white text-sm truncate block">{successDetails?.shop_name || data.shop_name}</span>
                                    </div>
                                    <div className="h-8 w-px bg-white/20 shrink-0" />
                                    <div className="min-w-0 px-2">
                                        <span className="text-emerald-300 block text-[10px] font-bold uppercase tracking-wider">মালিক / প্রোপ্রাইটর</span>
                                        <span className="font-extrabold text-white text-sm truncate block">{successDetails?.user_name || data.name}</span>
                                    </div>
                                    <div className="h-8 w-px bg-white/20 shrink-0" />
                                    <div className="min-w-0 pl-2">
                                        <span className="text-emerald-300 block text-[10px] font-bold uppercase tracking-wider">প্যানেল স্ট্যাটাস</span>
                                        <span className="inline-flex items-center gap-1 font-bold text-amber-300 text-xs">
                                            <Clock className="w-3 h-3" /> রিভিউ চলছে
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Comprehensive System Rules & Guidelines */}
                        <div className="p-5 sm:p-7 space-y-3.5 text-slate-700 text-xs sm:text-sm overflow-y-auto flex-1">
                            <div className="flex items-center gap-2 text-indigo-950 font-black text-sm sm:text-base border-b border-slate-100 pb-2.5">
                                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                                <span>ভেন্ডর প্যানেল অনুমোদন ও পরিচালনার নিয়মাবলী</span>
                            </div>

                            <div className="space-y-3">
                                {/* Rule 1: কখন একটিভ হবে? */}
                                <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 transition hover:shadow-xs">
                                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                                        ১
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                                            <span>কখন শপটি সক্রিয় (Active) হবে?</span>
                                            <span className="text-xs">⏳</span>
                                        </h4>
                                        <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                                            আপনার দেওয়া সকল তথ্য (জাতীয় পরিচয়পত্র/NID, ব্যাংক অ্যাকাউন্ট ও শপের ঠিকানা) আমাদের ভেরিফিকেশন টিম পর্যালোচনা করছে। সাধারণত <strong>১২ থেকে ২৪ ঘণ্টার মধ্যে</strong> সুপার অ্যাডমিন রিভিউ সম্পন্ন করে শপটি সম্পূর্ণ <strong>অ্যাক্টিভ ও অ্যাপ্রুভ (Approved)</strong> করে দেবে।
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 2: কখন শপে প্রোডাক্ট আপলোড করতে পারবে? */}
                                <div className="bg-blue-50/90 border border-blue-200/90 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 transition hover:shadow-xs">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                                        ২
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-blue-950 text-xs sm:text-sm flex items-center gap-1.5">
                                            <span>কখন ভেন্ডর প্যানেল ব্যবহার শুরু করতে পারবেন?</span>
                                            <span className="text-xs">📦</span>
                                        </h4>
                                        <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                                            <strong>এখন থেকেই!</strong> আপনি এখনই আপনার সেলার ড্যাশবোর্ডে প্রবেশ করে শপ প্রোফাইল সাজাতে পারবেন, ব্যানার ও লোগো যুক্ত করতে পারবেন এবং নতুন প্রোডাক্ট আপলোড করে প্রস্তুত রাখতে পারবেন।
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 3: কখন লাইভ হবে? */}
                                <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 transition hover:shadow-xs">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                                        ৩
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                                            <span>ক্রেতাদের কাছে কখন প্রোডাক্ট লাইভ হবে?</span>
                                            <span className="text-xs">🚀</span>
                                        </h4>
                                        <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                                            সুপার অ্যাডমিন শপটি অনুমোদন (Active/Approved) করার <strong>সাথে সাথে</strong> আপনার আপলোড করা সকল প্রোডাক্ট Guruz ই-কমার্স প্ল্যাটফর্মের হোম পেজ, ক্যাটাগরি তালিকা এবং সার্চে সকল ক্রেতার জন্য <strong>সম্পূর্ণ লাইভ ও বিক্রয়ের জন্য উন্মুক্ত</strong> হবে।
                                        </p>
                                    </div>
                                </div>

                                {/* Rule 4: নোটিফিকেশন ও কনফার্মেশন */}
                                <div className="bg-purple-50/90 border border-purple-200/90 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3 transition hover:shadow-xs">
                                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                                        ৪
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-purple-950 text-xs sm:text-sm flex items-center gap-1.5">
                                            <span>কনফার্মেশন নোটিফিকেশন</span>
                                            <span className="text-xs">🔔</span>
                                        </h4>
                                        <p className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">
                                            আপনার শপ অনুমোদন সম্পন্ন হওয়া মাত্রই আপনার প্রদত্ত ইমেইল এবং মোবাইল নম্বরে কনফার্মেশন মেসেজ পৌঁছে যাবে।
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Action Buttons */}
                        <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 rounded-b-3xl flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            <a
                                href="/seller"
                                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer text-center"
                            >
                                <span>সরাসরি ভেন্ডর প্যানেলে প্রবেশ করুন</span>
                                <Rocket className="w-4 h-4" />
                            </a>
                            <a
                                href="/"
                                className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition text-center cursor-pointer"
                            >
                                হোমে যান
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
