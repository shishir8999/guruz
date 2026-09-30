import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Save, Plus, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function VendorLandingPageCms() {

    // Hero Section State
    const [heroTitleBn, setHeroTitleBn] = useState('আপনার পণ্য বিক্রি করুন কোটি গ্রাহকের কাছে');
    const [heroTitleEn, setHeroTitleEn] = useState('Sell your products to every customers');
    const [heroDescBn, setHeroDescBn] = useState('একটি প্ল্যাটফর্ম যেখানে আপনি অনলাইনে, ইন-পারসন এবং অনলাইনে বিক্রি করতে পারবেন। Guruz সেলার হয়ে আপনার ব্যবসা বাড়ান।');
    const [heroDescEn, setHeroDescEn] = useState('One platform that lets you sell wherever your customers are — online, in-person, and everywhere in between. Become a Guruz seller and grow your business!');
    const [heroLoginBoxBn, setHeroLoginBoxBn] = useState('পাসওয়ার্ড দিয়ে লগইন');
    const [heroLoginBoxEn, setHeroLoginBoxEn] = useState('Login with Password');
    const [heroSubmitBn, setHeroSubmitBn] = useState('সাবমিট');
    const [heroSubmitEn, setHeroSubmitEn] = useState('Submit');

    // Benefits Heading State
    const [benefitsTitleBn, setBenefitsTitleBn] = useState('একটি সমৃদ্ধ সেলার কমিউনিটিতে যোগ দিন');
    const [benefitsTitleEn, setBenefitsTitleEn] = useState('Join A Thriving Seller Community');
    const [benefitsDescBn, setBenefitsDescBn] = useState('হাজার হাজার সেলারের সাথে আপনার ব্যবসা সহজে বাড়ান কঠিন কাজটা আমরা করব — আপনি ব্র্যান্ড তৈরিতে মনোযোগ দিন।');
    const [benefitsDescEn, setBenefitsDescEn] = useState('Join thousands of happy sellers growing their business with ease. Let us handle the hard part while you focus on building your brand.');

    // Benefits Repeatable Items State
    const [benefits, setBenefits] = useState([
        { id: 1, icon: 'Store', titleBn: 'বিক্রেতার জন্য সহায়তা', titleEn: 'SUPPORT FOR SELLERS', descBn: 'আপনার ব্যবসার প্রতিটি ধাপে ২৪/৭ সহায়তা', descEn: '24/7 support at every step of your business' },
        { id: 2, icon: 'Users', titleBn: 'বিস্তৃত গ্রাহক পরিসর', titleEn: 'WIDE CUSTOMER REACH', descBn: 'সহজেই হাজার হাজার গ্রাহকের কাছে পৌঁছান', descEn: 'Reach thousands of customers with ease' },
        { id: 3, icon: 'Megaphone', titleBn: 'ফ্রি প্রোডাক্ট মার্কেটিং', titleEn: 'FREE PRODUCT MARKETING', descBn: 'বিনামূল্যে প্রোডাক্ট প্রচার, বিক্রি বাড়ান', descEn: 'Promote your products for free, boost your sales' },
        { id: 4, icon: 'BadgePercent', titleBn: 'লোকাল সেলার প্রমোশন', titleEn: 'LOCAL SELLER PROMOTION', descBn: 'স্থানীয় বিক্রেতাদের জন্য বিশেষ প্রমোশন', descEn: 'Special promotions for local sellers' },
    ]);

    // Steps Heading & Items State
    const [stepsTitleBn, setStepsTitleBn] = useState('৩টি সহজ ধাপে সেলিং শুরু করুন');
    const [stepsTitleEn, setStepsTitleEn] = useState('Start Your Selling Journey In 3 Easy Steps');
    const [stepsDescBn, setStepsDescBn] = useState('নিচের সহজ ধাপগুলো অনুসরণ করলেই আপনি সেলার হয়ে যাবেন।');
    const [stepsDescEn, setStepsDescEn] = useState('Follow these simple steps and you\'re on your way to becoming a seller.');

    const [steps, setSteps] = useState([
        { id: 1, icon: 'ClipboardList', titleBn: 'সহজ সাইন আপ', titleEn: 'Easy Sign up', descBn: 'মোবাইল নম্বর ও ব্যবসার তথ্য দিয়ে সাইন আপ করুন', descEn: 'Sign up using your mobile number & Business informations' },
        { id: 2, icon: 'PackageCheck', titleBn: 'প্রোডাক্ট তালিকাভুক্ত করুন', titleEn: 'Enlist Products', descBn: 'আমাদের ইনভেন্টরিতে প্রোডাক্ট যুক্ত করে লক্ষ লক্ষ গ্রাহকের কাছে পৌঁছান', descEn: 'Enlist products to our inventory & reach millions of customers' },
        { id: 3, icon: 'Rocket', titleBn: 'বিক্রি শুরু করুন', titleEn: 'Start Selling', descBn: 'যাচাইকরণের পর আপনার প্রোডাক্ট লাইভ হবে ও বিক্রি শুরু হবে', descEn: 'Start selling as your products go live after verification' },
    ]);

    // App Banner State
    const [appTitleBn, setAppTitleBn] = useState('সবকিছু ম্যানেজ করুন চলার পথে');
    const [appTitleEn, setAppTitleEn] = useState('Manage Everything On The Go');
    const [appDescBn, setAppDescBn] = useState('Guruz সেলার অ্যাপ আপনার অনলাইন ব্যবসা যেকোনো জায়গা থেকে পরিচালনা করার সব টুলস দিয়ে তৈরি।');
    const [appDescEn, setAppDescEn] = useState('The Guruz Seller App is full of powerful tools to help you run and grow your online business from anywhere.');
    const [googlePlayUrl, setGooglePlayUrl] = useState('#');
    const [appStoreUrl, setAppStoreUrl] = useState('#');

    // Testimonials State
    const [testiTitleBn, setTestiTitleBn] = useState('হাজারো সেলারের বিশ্বস্ত');
    const [testiTitleEn, setTestiTitleEn] = useState('Trusted by Thousands of Sellers');
    const [testiDescBn, setTestiDescBn] = useState('দেখুন কীভাবে সাধারণ সেলেরা আমাদের সাথে সফল ব্যবসা গড়েছেন।');
    const [testiDescEn, setTestiDescEn] = useState('See how everyday sellers are building successful businesses with us');

    const [testimonials, setTestimonials] = useState([
        { id: 1, nameBn: 'মেহেদী হাসান', nameEn: 'Mohammad Hasan', quoteBn: 'Guruz-এর ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম আমার জন্য অ্যাসিস্ট্যান্টের মতো।', quoteEn: 'Guruz\'s inventory management is like my assistant.' },
        { id: 2, nameBn: 'ফারহানা নূর', nameEn: 'Farhana Noor', quoteBn: 'Guruz ব্যবহার করার পর অনলাইন অর্ডার নেওয়া খুব সহজ হয়ে গেছে।', quoteEn: 'Guruz made managing online orders simple.' },
        { id: 3, nameBn: 'সাজিদ হোসেন', nameEn: 'Sajid Hossain', quoteBn: 'Guruz আমার ব্যবসার পার্টনার।', quoteEn: 'Guruz is a partner for my business.' },
        { id: 4, nameBn: 'তানভীর আহমেদ', nameEn: 'Tanvir Ahmed', quoteBn: 'Guruz আমার ছোট ব্যবসাকে বড় করেছে।', quoteEn: 'Guruz grew my small business.' },
    ]);

    // FAQs State
    const [faqHeadingBn, setFaqHeadingBn] = useState('সাধারণ জিজ্ঞাসা');
    const [faqHeadingEn, setFaqHeadingEn] = useState('Frequently Asked Questions');

    const [faqs, setFaqs] = useState([
        { id: 1, qBn: 'আমি কীভাবে টাকা পাব?', qEn: 'How Do I Get Paid?', aBn: 'প্রতিটি সফল অর্ডারের পর নির্ধারিত সাইকেল অনুযায়ী আপনার ব্যাংকে টাকা পাঠানো হবে।', aEn: 'After each successful order, payments are sent to your bank account per the settlement cycle.' },
        { id: 2, qBn: 'শিপিং কীভাবে কাজ করে?', qEn: 'How Does Shipping Work?', aBn: 'আমাদের লজিস্টিক পার্টনার আপনার প্রোডাক্ট গ্রাহকের কাছে পৌঁছে দেবে।', aEn: 'Our logistics partners deliver your products to the customer.' },
        { id: 3, qBn: 'কখন শো সিডিউল করতে পারব?', qEn: 'When Can I Schedule A Show?', aBn: 'ভেরিফিকেশন সম্পন্ন হওয়ার পর সেলার প্যানেল থেকে যেকোনো সময় সিডিউল করতে পারবেন।', aEn: 'After verification, you can schedule any time from your seller panel.' },
        { id: 4, qBn: 'আমি কী বিক্রি করতে পারি?', qEn: 'What Can I Sell?', aBn: 'পলিসির নিষিদ্ধ তালিকা ছাড়া প্রায় সব ধরণের পণ্য বিক্রি করতে পারবেন।', aEn: 'Almost any product, except items on our prohibited list.' },
    ]);

    const handleSaveChanges = () => {
        Swal.fire({
            title: 'Saved!',
            text: 'Vendor Landing Page CMS content saved successfully.',
            icon: 'success',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true,
        });
    };

    return (
        <>

            <Head title="Vendor Landing Page CMS — Admin Panel" />

            <div className="space-y-6 max-w-5xl mx-auto">

                {/* Banner Header Card matching PDF */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Vendor Landing Page</h1>
                        <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                            Edit every text and link on the /vendor page.
                        </p>
                    </div>

                    <button
                        onClick={handleSaveChanges}
                        className="bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>



                {/* 1. Hero Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-slate-800">Hero</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">TITLE (BN)</label>
                            <input type="text" value={heroTitleBn} onChange={e => setHeroTitleBn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">TITLE (EN)</label>
                            <input type="text" value={heroTitleEn} onChange={e => setHeroTitleEn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">DESCRIPTION (BN)</label>
                            <textarea rows={3} value={heroDescBn} onChange={e => setHeroDescBn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">DESCRIPTION (EN)</label>
                            <textarea rows={3} value={heroDescEn} onChange={e => setHeroDescEn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                        </div>
                    </div>
                </div>

                {/* 2. Benefits Heading */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <h3 className="font-black text-sm text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-slate-800">Benefits Heading</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">TITLE (BN)</label>
                            <input type="text" value={benefitsTitleBn} onChange={e => setBenefitsTitleBn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">TITLE (EN)</label>
                            <input type="text" value={benefitsTitleEn} onChange={e => setBenefitsTitleEn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">DESCRIPTION (BN)</label>
                            <textarea rows={2} value={benefitsDescBn} onChange={e => setBenefitsDescBn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">DESCRIPTION (EN)</label>
                            <textarea rows={2} value={benefitsDescEn} onChange={e => setBenefitsDescEn(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold" />
                        </div>
                    </div>
                </div>

                {/* 3. Benefits Cards */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">Benefits</h3>
                        <button
                            type="button"
                            onClick={() => setBenefits([...benefits, { id: Date.now(), icon: 'Store', titleBn: '', titleEn: '', descBn: '', descEn: '' }])}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Benefit
                        </button>
                    </div>

                    <div className="space-y-4">
                        {benefits.map(b => (
                            <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ICON</label>
                                    <select value={b.icon} onChange={e => setBenefits(prev => prev.map(x => x.id === b.id ? { ...x, icon: e.target.value } : x))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold">
                                        <option value="Store">Store</option>
                                        <option value="Users">Users</option>
                                        <option value="Megaphone">Megaphone</option>
                                        <option value="BadgePercent">BadgePercent</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">TITLE (BN)</label>
                                        <input type="text" value={b.titleBn} onChange={e => setBenefits(prev => prev.map(x => x.id === b.id ? { ...x, titleBn: e.target.value } : x))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">TITLE (EN)</label>
                                        <input type="text" value={b.titleEn} onChange={e => setBenefits(prev => prev.map(x => x.id === b.id ? { ...x, titleEn: e.target.value } : x))} className="w-full bg-white dark:bg-slate-900 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold" />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBenefits(benefits.filter(x => x.id !== b.id))}
                                    className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-lg ml-auto block"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Save Changes Floating Action */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSaveChanges}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>

            </div>
        
</>
    );
}
