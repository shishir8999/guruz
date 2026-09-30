import { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { 
    User, Phone, Mail, Hash, Package, Tag, Cpu, Calendar, 
    AlertTriangle, MessageSquare, UploadCloud, Link as LinkIcon, 
    CheckCircle2, Box, ArrowRight, FileVideo, X, Copy, Check, Printer, FileText, Lock, ShieldCheck
} from 'lucide-react';

interface Props {
    initialUser?: {
        name?: string;
        email?: string;
        phone?: string;
    } | null;
    flash?: {
        success?: string;
        claim_number?: string;
    };
}

export default function WarrantyClaim({ initialUser, flash }: Props) {
    const { flash: pageFlash, siteSettings } = usePage<any>().props;

    // Strict Step Control: Starts at Step 1 (Terms & Conditions)
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);
    
    // Terms Checkbox state
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

    // File & Error state
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileSizeMb, setFileSizeMb] = useState<number | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [customError, setCustomError] = useState<string | null>(null);
    const [submittedClaimNo, setSubmittedClaimNo] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        customer_name: initialUser?.name || '',
        mobile_number: initialUser?.phone || '',
        email: initialUser?.email || '',
        order_id: '',
        product_name: '',
        brand_name: '',
        product_model: '',
        purchase_date: '',
        issue_category: '',
        problem_details: '',
        google_drive_link: '',
        video_file: null as File | null,
    });

    // Advance from Step 1 to Step 2
    const handleProceedToForm = () => {
        if (!termsAccepted) return;
        setMaxUnlockedStep(2);
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const sizeInMb = file.size / (1024 * 1024);
            
            if (sizeInMb > 500) {
                setCustomError('ভিডিও ফাইলটির সাইজ ৫০০MB এর চেয়ে বেশি। অনুগ্রহ করে ছোট ফাইল অথবা Google Drive লিংক দিন।');
                return;
            }

            setCustomError(null);
            setFileName(file.name);
            setFileSizeMb(Math.round(sizeInMb * 10) / 10);
            setData('video_file', file);
        }
    };

    const removeFile = () => {
        setFileName(null);
        setFileSizeMb(null);
        setData('video_file', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCustomError(null);

        // Required field validation
        if (!data.customer_name.trim() || !data.mobile_number.trim() || !data.product_name.trim() || !data.issue_category || !data.problem_details.trim()) {
            setCustomError('অনুগ্রহ করে ফরমের সমস্ত লাল চিহ্নিত প্রয়োজনীয় তথ্যগুলো সঠিকভাবে পূরণ করুন।');
            return;
        }

        // Auto-fix URL prefix if user omitted https://
        let formattedDriveLink = data.google_drive_link.trim();
        if (formattedDriveLink && !/^https?:\/\//i.test(formattedDriveLink)) {
            formattedDriveLink = 'https://' + formattedDriveLink;
            setData('google_drive_link', formattedDriveLink);
        }

        // Validation check for video proof
        if (!data.video_file && !formattedDriveLink) {
            setCustomError('অনুগ্রহ করে পণ্যের ভিডিও ফাইল আপলোড করুন অথবা ভিডিও লিংক/Google Drive লিংক দিন।');
            return;
        }

        post('/warranty-claim', {
            forceFormData: true,
            onSuccess: (pageProps) => {
                const claimNo = pageProps.props.flash?.claim_number || flash?.claim_number || 'WRN-' + Math.floor(100000 + Math.random() * 900000);
                setSubmittedClaimNo(claimNo);
                setMaxUnlockedStep(3);
                setCurrentStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onError: (errs) => {
                const firstErrorKey = Object.keys(errs)[0];
                if (firstErrorKey) {
                    setCustomError(errs[firstErrorKey]);
                } else {
                    setCustomError('ফরম জমাদানে সমস্যা হয়েছে। অনুগ্রহ করে সমস্ত তথ্য চেক করে পুনরায় চেষ্টা করুন।');
                }
            },
        });
    };

    const handleCopyClaimNo = () => {
        const claimToCopy = submittedClaimNo || pageFlash?.claim_number || flash?.claim_number;
        if (claimToCopy) {
            navigator.clipboard.writeText(claimToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handlePrintPdf = () => {
        window.print();
    };

    const displayClaimNo = submittedClaimNo || pageFlash?.claim_number || flash?.claim_number || 'WRN-509624';
    const currentDateFormatted = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });

    // Dynamic Website Info
    const siteLogo = siteSettings?.site_logo;
    const siteTitle = siteSettings?.site_title || 'GURUZ E-COMMERCE';
    const sitePhone = siteSettings?.support_phone || '01800000000';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://r.fabricspointbd.com';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Head title="Submit Your Warranty Claim — GURUZ Warranty Center" />

            {/* === STYLES FOR HIGH QUALITY PRINT/PDF OUTPUT === */}
            <style font-mono>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #pdf-print-container, #pdf-print-container * {
                        visibility: visible;
                    }
                    #pdf-print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white !important;
                        color: black !important;
                        padding: 20px !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* === TOP BLUE HEADER BANNER MATCHING SCREENSHOT === */}
            <header className="bg-[#1d4ed8] text-white py-4 px-4 shadow-md no-print">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        {siteLogo ? (
                            <img src={siteLogo} alt={siteTitle} className="h-9 max-h-9 object-contain bg-white/10 p-1 rounded-lg" />
                        ) : (
                            <span className="text-2xl font-black tracking-wider uppercase text-white">{siteTitle}</span>
                        )}
                        <span className="text-xs sm:text-sm font-semibold opacity-90 border-l border-white/30 pl-3">
                            | Warranty Claim Center
                        </span>
                    </Link>
                    <Link
                        href="/"
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5"
                    >
                        🏠 হোমপেজে যান
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">

                {/* ─── STRICT SEQUENTIAL 3-STEP PROGRESS STEPPER ─── */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 select-none no-print">
                    
                    {/* STEP 1 PILL */}
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                            currentStep === 1 
                                ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' 
                                : 'bg-emerald-600 text-white cursor-pointer'
                        }`}
                    >
                        <span className="w-5 h-5 rounded-full bg-white/20 text-center text-[11px] leading-5 font-black">1</span>
                        Terms & Conditions
                    </button>

                    <div className={`w-6 h-0.5 ${maxUnlockedStep >= 2 ? 'bg-blue-600' : 'bg-slate-300'}`} />

                    {/* STEP 2 PILL (LOCKED UNTIL STEP 1 CONFIRMED) */}
                    <button
                        type="button"
                        disabled={maxUnlockedStep < 2}
                        onClick={() => maxUnlockedStep >= 2 && setCurrentStep(2)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                            currentStep === 2 
                                ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100' 
                                : maxUnlockedStep > 2 
                                    ? 'bg-emerald-600 text-white cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                        }`}
                        title={maxUnlockedStep < 2 ? 'শর্তাবলী সম্মত হয়ে পরবর্তী ধাপে যান' : 'Claim Form'}
                    >
                        {maxUnlockedStep < 2 ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                            <span className="w-5 h-5 rounded-full bg-white/20 text-center text-[11px] leading-5 font-black">2</span>
                        )}
                        Claim Form
                    </button>

                    <div className={`w-6 h-0.5 ${maxUnlockedStep >= 3 ? 'bg-emerald-600' : 'bg-slate-300'}`} />

                    {/* STEP 3 PILL (LOCKED UNTIL FORM SUBMITTED) */}
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                        currentStep === 3 
                            ? 'bg-emerald-600 text-white shadow-md ring-4 ring-emerald-100' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-75'
                    }`}>
                        {maxUnlockedStep < 3 ? (
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                            <span className="w-5 h-5 rounded-full bg-white/20 text-center text-[11px] leading-5 font-black">3</span>
                        )}
                        Confirmation
                    </div>
                </div>

                {/* ─── STEP 1: TERMS & CONDITIONS ─── */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300 no-print">
                        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">ওয়ারেন্টি ক্লেইম সেবা ও শর্তাবলী</h2>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">আবেদন করার আগে শর্তাবলীগুলো মনোযোগ দিয়ে পড়ে দিন</p>
                            </div>
                        </div>

                        <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                            <p className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">১.</span> 
                                প্রোডাক্টের অফিসিয়াল ওয়ারেন্টি ক্যাশ মেমো বা অর্ডার আইডি অনুযায়ী প্রদান করা হবে।
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">২.</span> 
                                প্রোডাক্টের সমস্যা ভিডিওতে স্পষ্টভাবে ধারণ করে আপলোড অথবা Google Drive লিংক প্রদান করতে হবে।
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">৩.</span> 
                                শর্ট সার্কিট, ভৌত ভাঙচুর বা পানি প্রবেশের কারণে সৃষ্ট ক্ষতি ওয়ারেন্টির আওতাভুক্ত নয়।
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">৪.</span> 
                                ক্লেইম জমা দেওয়ার ১-৩ কার্যদিবসের মধ্যে আমাদের কাস্টমার কেয়ার প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
                            </p>
                        </div>

                        {/* CHECKBOX CONFIRMATION */}
                        <div className="pt-2">
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={e => setTermsAccepted(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                                    আমি ওয়ারেন্টি ক্লেইম সেবা ও সকল শর্তাবলীতে সম্মত আছি।
                                </span>
                            </label>
                        </div>

                        {/* PROCEED BUTTON TO STEP 2 */}
                        <div className="pt-2 flex justify-center">
                            <button
                                type="button"
                                disabled={!termsAccepted}
                                onClick={handleProceedToForm}
                                className={`w-full sm:w-auto font-black text-sm px-10 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider ${
                                    termsAccepted 
                                        ? 'bg-[#2563eb] hover:bg-blue-700 text-white shadow-blue-600/30 hover:scale-105 active:scale-95 cursor-pointer' 
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-75 shadow-none'
                                }`}
                            >
                                সম্মত আছি, ফর্ম পূরণ করুন <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── STEP 2: CLAIM FORM ─── */}
                {currentStep === 2 && maxUnlockedStep >= 2 && (
                    <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300 no-print">
                        
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-1">
                                <Box className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Submit Your Warranty Claim
                            </h1>
                            <p className="text-xs sm:text-sm font-bold text-slate-500">
                                ওয়ারেন্টি ক্লেইম প্রসেস শুরু করতে নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন।
                            </p>
                        </div>

                        {/* CUSTOM DYNAMIC VALIDATION ALERT */}
                        {customError && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-black text-red-800">ফর্ম পূরণে সতর্ক থাকুন:</p>
                                    <p>{customError}</p>
                                </div>
                            </div>
                        )}

                        {/* FORM GRID */}
                        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                            
                            {/* ROW 1: Customer Name & Mobile */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-blue-600" /> Customer Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="আপনার পূর্ণ নাম"
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-blue-600" /> Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="আপনার সচল মোবাইল নম্বর"
                                        value={data.mobile_number}
                                        onChange={e => setData('mobile_number', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                </div>
                            </div>

                            {/* ROW 2: Email & Order ID */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="আপনার ইমেইল ঠিকানা"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Hash className="w-3.5 h-3.5 text-blue-600" /> Order ID / Invoice
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="অর্ডার আইডি বা ইনভয়েস নম্বর"
                                        value={data.order_id}
                                        onChange={e => setData('order_id', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                </div>
                            </div>

                            {/* ROW 3: Product Name & Brand */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-blue-600" /> Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="পণ্যের নাম"
                                        value={data.product_name}
                                        onChange={e => setData('product_name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-blue-600" /> Brand Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="ব্র্যান্ডের নাম"
                                        value={data.brand_name}
                                        onChange={e => setData('brand_name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                </div>
                            </div>

                            {/* ROW 4: Product Model & Purchase Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Cpu className="w-3.5 h-3.5 text-blue-600" /> Product Model
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="মডেল নাম / নম্বর"
                                        value={data.product_model}
                                        onChange={e => setData('product_model', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-blue-600" /> Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.purchase_date}
                                        onChange={e => setData('purchase_date', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                </div>
                            </div>

                            {/* ROW 5: Issue Category */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-blue-600" /> Issue Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={data.issue_category}
                                    onChange={e => setData('issue_category', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50 cursor-pointer"
                                >
                                    <option value="">সমস্যার ধরন নির্বাচন করুন</option>
                                    <option value="Display Issue">ডিসপ্লে সমস্যা</option>
                                    <option value="Power/Charging">পাওয়ার / চার্জিং সমস্যা</option>
                                    <option value="Sound/Audio">সাউন্ড / অডিও সমস্যা</option>
                                    <option value="Connectivity">সংযোগ / কানেক্টিভিটি সমস্যা</option>
                                    <option value="Physical Damage">শারীরিক ক্ষতি</option>
                                    <option value="Other">অন্যান্য</option>
                                </select>
                            </div>

                            {/* ROW 6: Problem Details */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Problem Details <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="সমস্যাটি সংক্ষেপে লিখুন"
                                    value={data.problem_details}
                                    onChange={e => setData('problem_details', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                />
                            </div>

                            {/* ROW 7: UPLOAD VIDEO PROOF MATCHING SCREENSHOT */}
                            <div className="space-y-3 pt-2">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <UploadCloud className="w-4 h-4 text-blue-600" /> Upload Video Proof
                                </label>

                                {/* Drag & Drop Upload Zone */}
                                {!fileName ? (
                                    <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/60 transition group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition">
                                                <UploadCloud className="w-6 h-6" />
                                            </div>
                                            <p className="text-xs font-extrabold text-slate-700">
                                                পণ্যের বর্তমান অবস্থার ক্লিয়ার ভিডিও আপলোড করুন
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-400">
                                                ক্লিক করুন (সর্বোচ্চ ৫০০MB)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-blue-50/80 border-2 border-blue-300 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                                                <FileVideo className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 truncate max-w-xs">{fileName}</p>
                                                <p className="text-[11px] font-bold text-blue-600">{fileSizeMb} MB • প্রস্তুত</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="p-1.5 rounded-full hover:bg-blue-100 text-slate-500 hover:text-red-600 transition"
                                            title="মুছে ফেলুন"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Warning Notes */}
                                <div className="space-y-1 text-[11px] font-bold text-amber-700 bg-amber-50/80 border border-amber-200 p-3 rounded-xl">
                                    <p>⚠️ ভিডিও সর্বোচ্চ ৫০০MB হতে পারবে</p>
                                    <p>⚠️ ভিডিও আপলোড অথবা Google Drive লিংক দিতে হবে</p>
                                </div>

                                {/* Divider */}
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200"></div>
                                    <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">অথবা</span>
                                    <div className="flex-grow border-t border-slate-200"></div>
                                </div>

                                {/* Google Drive Video Link Input */}
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                        <LinkIcon className="w-3.5 h-3.5 text-blue-600" /> Google Drive Video Link
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://drive.google.com/file/d/... (লিংকটি Anyone with the link রাখুন)"
                                        value={data.google_drive_link}
                                        onChange={e => setData('google_drive_link', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-slate-50/50"
                                    />
                                    <p className="text-[11px] font-bold text-amber-700">⚠️ গুগল ড্রাইভে আপলোড করা পণ্যের সমস্যার স্পষ্ট ভিডিওর লিংক দিন (ভিডিও ছাড়া অন্য কোনো ফাইল যেমন JSON বা ডকুমেন্ট দিলে ড্রাইভ প্লেয়ারে ভিডিও প্রিভিউ হবে না)।</p>
                                </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="pt-4 flex justify-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#2563eb] hover:bg-blue-700 text-white font-black text-sm px-14 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                                >
                                    {processing ? 'জমাদান প্রক্রিয়াধীন...' : 'CLAIM NOW'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── STEP 3: CONFIRMATION & PDF DISPLAY ─── */}
                {currentStep === 3 && maxUnlockedStep >= 3 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-5 animate-in fade-in duration-300 no-print">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">
                                আপনার ওয়ারেন্টি ক্লেইম সফলভাবে জমা হয়েছে!
                            </h2>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 max-w-md mx-auto">
                                আমাদের টেকনিক্যাল টিম আপনার তথ্য ও ভিডিও টি বিশ্লেষণ করে আগামী ২৪-৪৮ ঘণ্টার মধ্যে যোগাযোগ করবে।
                            </p>
                            
                            <div className="inline-flex items-center gap-3 bg-slate-100 px-5 py-3 rounded-2xl border border-slate-200 font-mono text-sm font-bold text-slate-800">
                                <span>ট্র্যাকিং আইডি: <strong className="text-blue-600">{displayClaimNo}</strong></span>
                                <button
                                    type="button"
                                    onClick={handleCopyClaimNo}
                                    className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-1 transition cursor-pointer"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                                </button>
                            </div>

                            <div className="pt-4 flex justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handlePrintPdf}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                                >
                                    <Printer className="w-4 h-4" /> 🖨️ প্রিন্ট / ডাউনলোড করুন PDF
                                </button>
                                <Link
                                    href="/"
                                    className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-xl transition flex items-center gap-2"
                                >
                                    হোমপেজে ফিরে যান
                                </Link>
                            </div>
                        </div>

                        {/* 🌟 BEAUTIFUL DYNAMIC A4 PRINTABLE PDF CONTAINER 🌟 */}
                        <div id="pdf-print-container" className="bg-white rounded-2xl border-2 border-blue-600 p-8 sm:p-12 shadow-xl space-y-6">
                            
                            {/* PDF HEADER WITH DYNAMIC LOGO, URL & CUSTOMER CARE PHONE */}
                            <div className="flex items-center justify-between border-b-2 border-blue-600 pb-6">
                                <div className="space-y-1.5">
                                    {siteLogo ? (
                                        <img src={siteLogo} alt={siteTitle} className="h-12 max-h-12 object-contain mb-1" />
                                    ) : (
                                        <h1 className="text-3xl font-black tracking-wider text-blue-700 uppercase">{siteTitle}</h1>
                                    )}
                                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                        Official Warranty Claim Slip & Receipt
                                    </p>
                                    <p className="text-[11px] font-semibold text-slate-600">
                                        ওয়েবসাইট: <span className="font-bold text-blue-700">{siteUrl}</span> | কাস্টমার কেয়ার: <span className="font-bold text-slate-900">{sitePhone}</span>
                                    </p>
                                </div>

                                <div className="text-right space-y-1">
                                    <div className="inline-block bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                                        <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> VERIFIED CLAIM
                                        </span>
                                    </div>
                                    <p className="font-mono text-sm font-black text-slate-900">{displayClaimNo}</p>
                                    <p className="text-[11px] font-semibold text-slate-500">তারিখ: {currentDateFormatted}</p>
                                </div>
                            </div>

                            {/* CUSTOMER & CLAIM SPECIFICATION TABLE GRID */}
                            <div className="grid grid-cols-2 gap-6 text-xs text-slate-800">
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                    <h3 className="font-black text-blue-900 border-b pb-1.5 text-xs uppercase tracking-wider">
                                        👤 গ্রাহকের তথ্য (Customer Details)
                                    </h3>
                                    <p><strong className="text-slate-600">নাম:</strong> {data.customer_name || 'N/A'}</p>
                                    <p><strong className="text-slate-600">মোবাইল নম্বর:</strong> {data.mobile_number || 'N/A'}</p>
                                    <p><strong className="text-slate-600">ইমেইল:</strong> {data.email || 'N/A'}</p>
                                    <p><strong className="text-slate-600">ইনভয়েস/অর্ডার আইডি:</strong> {data.order_id || 'N/A'}</p>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                    <h3 className="font-black text-blue-900 border-b pb-1.5 text-xs uppercase tracking-wider">
                                        📦 পণ্যের তথ্য (Product Details)
                                    </h3>
                                    <p><strong className="text-slate-600">পণ্যের নাম:</strong> {data.product_name || 'N/A'}</p>
                                    <p><strong className="text-slate-600">ব্র্যান্ড ও মডেল:</strong> {data.brand_name || 'N/A'} {data.product_model ? `(${data.product_model})` : ''}</p>
                                    <p><strong className="text-slate-600">ক্রয়ের তারিখ:</strong> {data.purchase_date || 'N/A'}</p>
                                    <p><strong className="text-slate-600">সমস্যার ধরন:</strong> <span className="font-bold text-amber-700">{data.issue_category || 'N/A'}</span></p>
                                </div>
                            </div>

                            {/* PROBLEM DETAILS */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-800">
                                <h3 className="font-black text-blue-900 border-b pb-1.5 text-xs uppercase tracking-wider">
                                    💬 বিস্তারিত সমস্যা (Problem Details)
                                </h3>
                                <p className="leading-relaxed whitespace-pre-line font-medium text-slate-700">
                                    {data.problem_details || 'কোনো বর্ণনা দেওয়া হয়নি।'}
                                </p>
                            </div>

                            {/* VIDEO PROOF STATUS */}
                            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 flex items-center justify-between text-xs text-blue-950 font-bold">
                                <div className="flex items-center gap-2">
                                    <FileVideo className="w-5 h-5 text-blue-600" />
                                    <span>ভিডিও প্রমাণপত্র (Video Proof):</span>
                                </div>
                                <div>
                                    {fileName ? (
                                        <span className="text-emerald-700 font-extrabold">✓ ফাইল আপলোড করা হয়েছে ({fileName})</span>
                                    ) : data.google_drive_link ? (
                                        <span className="text-indigo-700 font-extrabold">✓ Google Drive লিংক সংযুক্ত</span>
                                    ) : (
                                        <span className="text-amber-700">সংযুক্ত</span>
                                    )}
                                </div>
                            </div>

                            {/* FOOTER & OFFICIAL SEAL */}
                            <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
                                <div className="space-y-1">
                                    <p className="font-bold text-slate-700">জরুরী নির্দেশনাবলী:</p>
                                    <p>• অনুগ্রহ করে এই স্লিপটি সংরক্ষণ করুন।</p>
                                    <p>• পণ্য কুরিয়ার বা সেন্টারে পাঠানোর সময় স্লিপটি সাথে সংযুক্ত রাখুন।</p>
                                </div>

                                <div className="text-center space-y-2">
                                    <div className="w-24 h-12 border-b border-dashed border-slate-400 mx-auto"></div>
                                    <p className="font-bold text-slate-700">Authorized Signature</p>
                                    <p className="text-[10px] text-slate-400">{siteTitle} Claim Center</p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

            </main>

            <footer className="py-4 text-center text-xs font-semibold text-slate-400 border-t border-slate-200 mt-auto no-print">
                © {new Date().getFullYear()} {siteTitle}. All rights reserved.
            </footer>
        </div>
    );
}
