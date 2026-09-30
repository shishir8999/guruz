import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Store, Users, Megaphone, BadgePercent, ClipboardList, PackageCheck,
    Rocket, ChevronDown, ChevronUp, Star, ShieldCheck, Smartphone
} from 'lucide-react';

export default function VendorLandingPage({ cms }: { cms?: any }) {
    const { props } = usePage<any>();
    const siteLogo = cms?.logo_url || props.siteSettings?.site_logo || props.cms?.logo_url;
    const siteName = props.siteSettings?.site_name || 'guruz';

    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [tab, setTab] = useState<'mobile' | 'email'>('mobile');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const heroTitle = cms?.hero_title || 'আপনার পণ্য বিক্রি করুন প্রতিটি গ্রাহকের কাছে';
    const heroSubtitle = cms?.hero_subtitle || 'একটি প্ল্যাটফর্ম যেখানে আপনি অনলাইনে, ইন-পারসন এবং সব জায়গায় বিক্রি করতে পারবেন। Guruz সেলার হয়ে আপনার ব্যবসা বাড়ান!';
    const buttonText = cms?.button_text || 'সেলার হিসেবে যোগ দিন';
    const heroBg = cms?.hero_bg_color || '#0a0a1a';
    const accentColor = cms?.hero_accent_color || '#10b981';

    const benefits = [
        { icon: Store, titleBn: 'বিক্রেতার জন্য সহায়তা', descBn: 'আপনার ব্যবসার প্রতিটি ধাপে ২৪/৭ সহায়তা', color: 'bg-emerald-100 text-emerald-600' },
        { icon: Users, titleBn: 'বিস্তৃত গ্রাহক পরিসর', descBn: 'সহজেই হাজার হাজার গ্রাহকের কাছে পৌঁছান', color: 'bg-blue-100 text-blue-600' },
        { icon: Megaphone, titleBn: 'ফ্রি প্রোডাক্ট মার্কেটিং', descBn: 'বিনামূল্যে প্রোডাক্ট প্রচার, বিক্রি বাড়ান', color: 'bg-orange-100 text-orange-600' },
        { icon: BadgePercent, titleBn: 'লোকাল সেলার প্রমোশন', descBn: 'স্থানীয় বিক্রেতাদের জন্য বিশেষ প্রমোশন', color: 'bg-purple-100 text-purple-600' },
    ];

    const steps = [
        { icon: ClipboardList, titleBn: 'সহজ সাইন আপ', descBn: 'মোবাইল নম্বর ও ব্যবসার তথ্য দিয়ে সাইন আপ করুন', color: 'bg-blue-100 text-blue-600' },
        { icon: PackageCheck, titleBn: 'প্রোডাক্ট তালিকাভুক্ত করুন', descBn: 'আমাদের ইনভেন্টরিতে প্রোডাক্ট যুক্ত করে লক্ষ লক্ষ গ্রাহকের কাছে পৌঁছান', color: 'bg-emerald-100 text-emerald-600' },
        { icon: Rocket, titleBn: 'বিক্রি শুরু করুন', descBn: 'যাচাইকরণের পর আপনার প্রোডাক্ট লাইভ হবে ও বিক্রি শুরু হবে', color: 'bg-rose-100 text-rose-600' },
    ];

    const testimonials = [
        { nameBn: 'মেহেদী হাসান', role: 'Seller, Dhaka', quote: 'Guruz-এর ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম আমার জন্য অ্যাসিস্ট্যান্টের মতো।', avatar: 'M', color: 'bg-emerald-500' },
        { nameBn: 'ফারহানা নূর', role: 'Seller, Chittagong', quote: 'Guruz ব্যবহার করার পর অনলাইন অর্ডার নেওয়া খুব সহজ হয়ে গেছে।', avatar: 'F', color: 'bg-pink-500' },
        { nameBn: 'সাজিদ হোসেন', role: 'Seller, Sylhet', quote: 'Guruz আমার ব্যবসার পার্টনার।', avatar: 'S', color: 'bg-blue-500' },
        { nameBn: 'তানভীর আহমেদ', role: 'Seller, Rajshahi', quote: 'Guruz আমার ছোট ব্যবসাকে বড় করেছে।', avatar: 'T', color: 'bg-amber-500' },
    ];

    const faqs = [
        { q: 'আমি কীভাবে টাকা পাব?', a: 'প্রতিটি সফল অর্ডারের পর নির্ধারিত সাইকেল অনুযায়ী আপনার ব্যাংকে টাকা পাঠানো হবে।' },
        { q: 'শিপিং কীভাবে কাজ করে?', a: 'আমাদের লজিস্টিক পার্টনার আপনার প্রোডাক্ট গ্রাহকের কাছে পৌঁছে দেবে।' },
        { q: 'কখন শো সিডিউল করতে পারব?', a: 'ভেরিফিকেশন সম্পন্ন হওয়ার পর সেলার প্যানেল থেকে যেকোনো সময় সিডিউল করতে পারবেন।' },
        { q: 'আমি কী বিক্রি করতে পারি?', a: 'পলিসির নিষিদ্ধ তালিকা ছাড়া প্রায় সব ধরণের পণ্য বিক্রি করতে পারবেন।' },
    ];

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        if (tab === 'email' && email) {
            window.location.href = `/vendor/register?email=${encodeURIComponent(email)}`;
        } else if (tab === 'mobile' && phone) {
            window.location.href = `/vendor/register?phone=${encodeURIComponent(phone)}`;
        } else {
            window.location.href = '/vendor/register';
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
            <Head title="বিক্রেতা হোম — Guruz" />

            {/* ─── STANDALONE NAVBAR ─── */}
            <nav className="bg-[#09152a] text-white px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg border-b border-slate-800">
                <Link href="/" className="flex items-center gap-2">
                    {siteLogo ? (
                        <img src={siteLogo.startsWith('http') || siteLogo.startsWith('/') ? siteLogo : `/storage/${siteLogo}`} alt={siteName} className="h-9 max-h-9 object-contain max-w-[180px]" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-sm shadow">
                                g
                            </div>
                            <span className="font-black text-xl tracking-tight text-white">{siteName}</span>
                        </div>
                    )}
                </Link>

                <div className="flex items-center gap-3">
                    <Link href="/login" className="text-xs font-bold text-slate-300 hover:text-white transition px-3 py-1.5 rounded-xl hover:bg-white/10">
                        লগইন করুন
                    </Link>
                    <Link href="/vendor/register" className="text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-xl transition shadow">
                        {buttonText}
                    </Link>
                </div>
            </nav>

            {/* ─── HERO SECTION ─── */}
            <section className="relative text-white overflow-hidden" style={{ backgroundColor: heroBg }}>
                {/* Starfield BG */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent pointer-events-none" />

                <div className="container mx-auto px-4 py-20 max-w-6xl flex flex-col lg:flex-row items-center gap-12">
                    {/* Left Text */}
                    <div className="flex-1 space-y-5">
                        <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                            {heroTitle}
                        </h1>
                        <p className="text-slate-300 text-base leading-relaxed max-w-lg">
                            {heroSubtitle}
                        </p>
                    </div>

                    {/* Right Sign-up Form Box matching screenshot */}
                    <div className="w-full lg:w-80 bg-white text-slate-900 rounded-2xl shadow-2xl p-6 space-y-4 shrink-0">
                        <h3 className="font-black text-base text-slate-900">সেলার হিসেবে সাইন আপ করুন</h3>
                        <p className="text-xs text-slate-500 font-semibold">২ ধাপে সাইন আপ করুন</p>

                        {/* Tab Switcher */}
                        <div className="flex rounded-xl overflow-hidden border border-slate-200">
                            <button
                                onClick={() => setTab('mobile')}
                                className={`flex-1 py-2 text-xs font-bold transition ${tab === 'mobile' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
                            >
                                মোবাইল / OTP
                            </button>
                            <button
                                onClick={() => setTab('email')}
                                className={`flex-1 py-2 text-xs font-bold transition ${tab === 'email' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}
                            >
                                ইমেইল
                            </button>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-3">
                            {tab === 'mobile' ? (
                                <div className="flex gap-2">
                                    <span className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 text-slate-700 flex items-center gap-1 shrink-0">
                                        🇧🇩 +880
                                    </span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="01XXX-XXXX-XX"
                                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    />
                                </div>
                            ) : (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="আপনার ইমেইল"
                                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                />
                            )}

                            <button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl shadow transition"
                            >
                                পরবর্তী →
                            </button>

                            <div className="text-center">
                                <Link href="/login" className="text-xs text-emerald-600 font-semibold hover:underline">
                                    আপনার অ্যাকাউন্টে লগইন করুন
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* ─── BENEFITS SECTION ─── */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-5xl text-center space-y-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">একটি সমৃদ্ধ সেলার কমিউনিটিতে যোগ দিন</h2>
                        <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                            হাজার হাজার সেলারের সাথে আপনার ব্যবসা সহজে বাড়ান — কঠিন কাজটা আমরা করব, আপনি ব্র্যান্ড তৈরিতে মনোযোগ দিন।
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {benefits.map((b, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 hover:shadow-md transition">
                                <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center`}>
                                    <b.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-xs text-slate-900 text-center">{b.titleBn}</h3>
                                <p className="text-[11px] text-slate-500 text-center">{b.descBn}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── 3 STEPS SECTION ─── */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4 max-w-4xl text-center space-y-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">৩টি সহজ ধাপে সেলিং শুরু করুন</h2>
                        <p className="text-sm text-slate-500 mt-2">নিচের সহজ ধাপগুলো অনুসরণ করলেই আপনি সেলার হয়ে যাবেন।</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {steps.map((s, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                                <div className={`w-14 h-14 rounded-2xl ${s.color} flex items-center justify-center`}>
                                    <s.icon className="w-7 h-7" />
                                </div>
                                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">{i + 1}</span>
                                <h3 className="font-black text-sm text-slate-900">{s.titleBn}</h3>
                                <p className="text-xs text-slate-500 text-center">{s.descBn}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── APP BANNER SECTION ─── */}
            <section className="py-16 bg-[#1a1a2e] text-white">
                <div className="container mx-auto px-4 max-w-5xl flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 space-y-5">
                        <h2 className="text-2xl font-black">সবকিছু ম্যানেজ করুন চলার পথে</h2>
                        <p className="text-sm text-slate-300 max-w-md">
                            Guruz সেলার অ্যাপ আপনার অনলাইন ব্যবসা যেকোনো জায়গা থেকে পরিচালনা করার সব টুলস দিয়ে তৈরি।
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="bg-black border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-white/10 transition">
                                <Smartphone className="w-4 h-4" /> Google Play
                            </a>
                            <a href="#" className="bg-black border border-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-white/10 transition">
                                <Smartphone className="w-4 h-4" /> App Store
                            </a>
                        </div>
                    </div>
                    <div className="w-36 h-56 bg-slate-700/50 rounded-3xl border border-white/10 flex items-center justify-center shrink-0">
                        <Smartphone className="w-16 h-16 text-white/30" />
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS SECTION ─── */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-5xl text-center space-y-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">হাজারো সেলারের বিশ্বস্ত</h2>
                        <p className="text-sm text-slate-500 mt-2">দেখুন কীভাবে সাধারণ সেলেরা আমাদের সাথে সফল ব্যবসা গড়েছেন।</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {testimonials.map((t, i) => (
                            <div key={i} className="p-5 border border-slate-100 rounded-2xl text-left space-y-3 hover:shadow-md transition">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full ${t.color} text-white font-black flex items-center justify-center text-sm`}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="font-black text-xs text-slate-900">{t.nameBn}</div>
                                        <div className="text-[10px] text-slate-400">{t.role}</div>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                                </div>
                                <p className="text-[11px] text-slate-600 leading-relaxed">"{t.quote}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── FAQ SECTION ─── */}
            <section className="py-16 bg-slate-50">
                <div className="container mx-auto px-4 max-w-2xl space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 text-center">সাধারণ জিজ্ঞাসা</h2>

                    <div className="space-y-3">
                        {faqs.map((f, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold text-slate-900 hover:bg-slate-50 transition text-left"
                                >
                                    {f.q}
                                    {openFaq === i
                                        ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                                        : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                    }
                                </button>
                                {openFaq === i && (
                                    <div className="px-5 pb-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                                        {f.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA SECTION ─── */}
            <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center space-y-5">
                <h2 className="text-2xl font-black">এখনই সেলার হোন!</h2>
                <p className="text-sm text-purple-100">হাজারো সফল সেলারের দলে যোগ দিন। সাইন আপ করতে মাত্র ২ মিনিট লাগে।</p>
                <Link
                    href="/register"
                    className="inline-block bg-white text-purple-700 font-black px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition hover:scale-105"
                >
                    ফ্রিতে শুরু করুন →
                </Link>
            </section>

            {/* ─── SIMPLE FOOTER STRIP ─── */}
            <footer className="bg-[#09152a] text-slate-400 text-center py-6 text-xs font-semibold border-t border-slate-800">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Link href="/" className="flex items-center gap-2 text-white font-black text-sm">
                        {siteLogo ? (
                            <img src={siteLogo.startsWith('http') || siteLogo.startsWith('/') ? siteLogo : `/storage/${siteLogo}`} alt={siteName} className="h-7 max-h-7 object-contain max-w-[140px]" />
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-[10px]">g</div>
                                <span>{siteName}</span>
                            </div>
                        )}
                    </Link>
                    <span className="text-slate-600">|</span>
                    <Link href="/pages/terms" className="hover:text-white transition">Terms</Link>
                    <Link href="/pages/privacy" className="hover:text-white transition">Privacy</Link>
                    <Link href="/pages/contact" className="hover:text-white transition">Contact</Link>
                    <span className="text-slate-600">|</span>
                    <span>© 2025 Guruz. All rights reserved.</span>
                </div>
            </footer>
        </div>
    );
}
