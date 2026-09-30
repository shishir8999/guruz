import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, Award, FileText, CheckCircle2, ArrowLeft, Headphones, PhoneCall, Mail } from 'lucide-react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';

interface PolicyProps {
    type?: string;
    title?: string;
    content?: string;
}

export default function Policy({ type = 'policy', title = 'প পলিসি ও শর্তাবলী', content }: PolicyProps) {
    const isWarranty = type === 'warranty' || title?.toLowerCase().includes('warranty');

    return (
        <div className="min-h-screen bg-[#f8f9fb] flex flex-col justify-between font-sans text-slate-800">
            <Head title={title || 'Page Details'} />

            <div>
                <Header />

                <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
                    {/* Top Breadcrumb & Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
                                {isWarranty ? <Award className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    {title}
                                </h1>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    গুরুজ ই-কমার্স সিকিউরিটি, ওয়ারেন্টি ও পলিসি গাইডলাইন
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-sm transition active:scale-95 shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4 text-emerald-400" />
                            <span>মূল ওয়েবসাইটে ফিরে যান</span>
                        </Link>
                    </div>

                    {/* Main Content Box */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
                        {isWarranty ? (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200 p-5 rounded-2xl space-y-2">
                                    <h2 className="text-base font-black text-amber-900 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-600" />
                                        <span>১০০% অরিজিনাল ব্র্যান্ড ওয়ারেন্টি রিপ্লেসমেন্ট সুবিধা</span>
                                    </h2>
                                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                        গুরুজ ডট কম-এ প্রতিটি ইলেকট্রনিক্স, গ্যাজেট ও অ্যাক্সেসরিজ প্রোডাক্টের সাথে প্রস্তুতকারক ও সেলার কর্তৃক নির্ধারিত অফিসিয়াল ওয়ারেন্টি পলিসি প্রযোজ্য।
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-extrabold text-sm text-slate-900 border-b pb-2">
                                        ওয়ারেন্টি ক্লেম করার নিয়মসমূহ:
                                    </h3>
                                    <ul className="space-y-3 text-xs text-slate-700 font-medium">
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span>প্রোডাক্টটির অরিজিনাল ক্যাশমেমো / অর্ডার আইডি ইনভয়েস সাথে রাখতে হবে।</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span>প্রোডাক্টে কোনো শারীরিক ক্ষয়ক্ষতি (Physical damage/water damage) থাকলে ওয়ারেন্টি বাতিল বলে গণ্য হবে।</span>
                                        </li>
                                        <li className="flex items-start gap-2.5">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <span>যেকোনো যান্ত্রিক ত্রুটি দেখা দিলে আমাদের সাপোর্ট টিমে সরাসরি কল করুন অথবা মেসেজ পাঠান।</span>
                                        </li>
                                    </ul>
                                </div>

                                {content && (
                                    <div className="pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                        {content}
                                    </div>
                                )}

                                {/* Customer Support Contact Block */}
                                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                                            <Headphones size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-xs text-slate-900">ওয়ারেন্টি ক্লেম সহায়তার জন্য যোগাযোগ করুন</h4>
                                            <p className="text-[11px] text-slate-500 font-semibold">আমাদের ২৪/৭ সাপোর্ট টিম আপনাকে সর্বাত্মক সাহায্য করবে</p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/account/messages"
                                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
                                    >
                                        <Mail size={14} />
                                        <span>সাপোর্ট টিমে মেসেজ লিখুন ➔</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {content ? (
                                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                        {content}
                                    </div>
                                ) : (
                                    <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 font-medium">
                                        <p>গুরুজ ই-কমার্স প্ল্যাটফর্মে আপনাকে স্বাগতম। আমাদের মূল লক্ষ্য হলো কাস্টমারদের সর্বোচ্চ সেবার নিশ্চয়তা দেওয়া।</p>
                                        <p>আমাদের সকল তথ্য ও নীতিমালা অত্যন্ত স্বচ্ছতা ও নিরাপত্তার সাথে সংরক্ষিত। যেকোনো সহায়তার জন্য আমাদের সাপোর্ট সেন্টারে যোগাযোগ করুন।</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}
