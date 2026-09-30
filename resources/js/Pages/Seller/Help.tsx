import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    HelpCircle, 
    Search, 
    Book, 
    Video, 
    MessageCircle, 
    FileText, 
    ChevronRight, 
    ExternalLink, 
    Package, 
    CreditCard, 
    Truck, 
    ShieldCheck, 
    RotateCcw, 
    Play, 
    ThumbsUp, 
    ThumbsDown, 
    PhoneCall, 
    LifeBuoy, 
    CheckCircle2, 
    Clock, 
    ArrowRight,
    X
} from 'lucide-react';
import Swal from 'sweetalert2';

interface FAQItem {
    id: number;
    category: 'products' | 'payouts' | 'shipping' | 'account' | 'returns';
    q: string;
    a: string;
    steps?: string[];
}

export default function Help() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'products' | 'payouts' | 'shipping' | 'account' | 'returns'>('all');
    const [feedback, setFeedback] = useState<Record<number, 'yes' | 'no'>>({});
    const [selectedVideo, setSelectedVideo] = useState<{ title: string; embedUrl: string } | null>(null);

    const categories = [
        { id: 'all', label: 'All Topics', icon: HelpCircle },
        { id: 'products', label: 'Products & Inventory', icon: Package },
        { id: 'payouts', label: 'Payouts & Earnings', icon: CreditCard },
        { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
        { id: 'account', label: 'Account & Verification', icon: ShieldCheck },
        { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
    ];

    const faqs: FAQItem[] = [
        {
            id: 1,
            category: 'products',
            q: 'How do I upload a new product to my shop?',
            a: 'Adding a product is simple and takes less than 2 minutes. Make sure to provide clear photos and detailed descriptions.',
            steps: [
                'Navigate to Shop Products > Add Product from your seller menu.',
                'Enter product title, category, price, and stock quantity.',
                'Upload crisp product images (square ratio recommended).',
                'Click "Save & Publish". Your listing will go live immediately or after quick admin approval.'
            ]
        },
        {
            id: 2,
            category: 'products',
            q: 'Can I import products in bulk using CSV?',
            a: 'Yes! You can bulk upload hundreds of items at once using our CSV Import tool under Products > Import CSV.',
            steps: [
                'Download the sample CSV template from the Import page.',
                'Fill in product details following the template headers.',
                'Upload your CSV file and map columns to complete bulk creation.'
            ]
        },
        {
            id: 3,
            category: 'payouts',
            q: 'When and how will I receive my payouts?',
            a: 'Payouts are processed automatically every week or whenever you request an instant withdrawal once your available balance meets the minimum threshold (৳1,000).',
            steps: [
                'Ensure your banking or mobile banking details are updated in Accounts > Banking Settings.',
                'Go to Payouts and click "Request Payout".',
                'Select your preferred payment method and enter the withdrawal amount.',
                'Approved funds are transferred to your account within 24-48 hours.'
            ]
        },
        {
            id: 4,
            category: 'payouts',
            q: 'How is seller commission calculated?',
            a: 'Commission is transparently deducted per completed order based on your product category agreement. You can view itemized commission breakdowns anytime under the Profit & Loss statement.',
        },
        {
            id: 5,
            category: 'shipping',
            q: 'How do I integrate automated courier delivery (Steadfast / Pathao / RedX)?',
            a: 'Go to Courier Settings in your sidebar. Enter your API credentials for Steadfast or Pathao to enable 1-click automated order dispatching, invoice printing, and live tracking.',
        },
        {
            id: 6,
            category: 'account',
            q: 'How do I get the Green "Verified Seller" Badge?',
            a: 'Submit your NID card (Front & Back) and Trade License image on the KYC / Verification page. Once reviewed by our admin team, your shop gets an instant green Verified badge visible to all buyers.',
        },
        {
            id: 7,
            category: 'returns',
            q: 'What is the procedure for customer return requests?',
            a: 'When a customer requests a return, you will be notified under the Returns page. Review the return reason and item photo evidence. Approve the request once the returned item is delivered back to your shop address.',
        }
    ];

    const videoTutorials = [
        {
            title: 'How to Setup Shop & Upload First Product',
            duration: '4:15 min',
            bgGradient: 'from-blue-600 to-indigo-700',
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        },
        {
            title: 'Configuring Courier API & Auto Shipping',
            duration: '3:40 min',
            bgGradient: 'from-purple-600 to-pink-700',
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        },
        {
            title: 'Managing Withdrawals & Bank Accounts',
            duration: '2:50 min',
            bgGradient: 'from-emerald-600 to-teal-700',
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        }
    ];

    const quickPopularTags = [
        'Add Product', 'Withdrawal Rules', 'Steadfast Courier', 'NID Verification', 'Commission Rates', 'Returns'
    ];

    const filteredFaqs = faqs.filter(faq => {
        const matchesTab = activeTab === 'all' || faq.category === activeTab;
        const matchesSearch = faq.q.toLowerCase().includes(search.toLowerCase()) || 
                              faq.a.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleFeedback = (id: number, type: 'yes' | 'no') => {
        setFeedback(prev => ({ ...prev, [id]: type }));
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Thank you for your feedback!',
            showConfirmButton: false,
            timer: 2000,
        });
    };

    return (
        <>
            <Head title="Help Center & Knowledge Base — Seller Portal" />

            <div className="max-w-7xl mx-auto space-y-8 pb-16">

                {/* Hero Header Section */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                            <LifeBuoy className="w-3.5 h-3.5 text-indigo-400" />
                            24/7 Seller Support Hub
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            How can we help your business today?
                        </h1>
                        
                        <p className="text-slate-300 text-sm sm:text-base font-medium">
                            Search our interactive knowledge base, watch step-by-step video tutorials, or connect directly with our dedicated seller support.
                        </p>

                        {/* Search Input Box */}
                        <div className="relative max-w-2xl mx-auto mt-6">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search help topics, e.g. How to request payout, NID verification..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-400 shadow-xl border border-white/20 text-sm"
                            />
                            {search && (
                                <button 
                                    onClick={() => setSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Quick Tags */}
                        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
                            <span className="text-xs text-slate-400 font-semibold">Popular:</span>
                            {quickPopularTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setSearch(tag)}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition cursor-pointer border border-white/10"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Status Banner */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
                    <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>All Seller Services Operational (Payments, Auto-Courier API, Product Approvals)</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">System Status: 99.9% Uptime</span>
                </div>

                {/* Video Tutorials Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Video Tutorials
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Quick step-by-step visual guides to master your seller portal</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {videoTutorials.map((vid, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setSelectedVideo(vid)}
                                className={`group relative rounded-2xl bg-gradient-to-br ${vid.bgGradient} p-6 text-white shadow-md hover:shadow-xl transition duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-44`}
                            >
                                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition duration-500" />
                                
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/30 backdrop-blur-md">
                                        {vid.duration}
                                    </span>
                                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white text-slate-900 transition">
                                        <Play className="w-4 h-4 text-white group-hover:text-indigo-600 fill-current ml-0.5" />
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="font-bold text-sm leading-snug group-hover:underline">{vid.title}</h3>
                                    <p className="text-[11px] text-white/80 font-medium mt-1 flex items-center gap-1">
                                        Watch Guide <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Knowledge Base Section with Left Sidebar & FAQs */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-4">

                    {/* Left: Category Navigation Filter */}
                    <div className="lg:col-span-1 space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Categories</h3>
                        
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xs space-y-1">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                const isActive = activeTab === cat.id;
                                const count = cat.id === 'all' 
                                    ? faqs.length 
                                    : faqs.filter(f => f.category === cat.id).length;

                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTab(cat.id as any)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                                            isActive
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
                                            <span>{cat.label}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dedicated Support Card */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white space-y-4 shadow-md">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <PhoneCall className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Need Direct Help?</h4>
                                <p className="text-xs text-indigo-100 mt-1">Our seller relations agent is available 9 AM – 9 PM daily.</p>
                            </div>
                            
                            <div className="space-y-2 pt-1">
                                <a 
                                    href="/seller/report-issue" 
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 transition shadow-xs"
                                >
                                    <MessageCircle className="w-4 h-4" /> Open Support Ticket
                                </a>
                                <a 
                                    href="https://wa.me/8801700000000" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
                                >
                                    WhatsApp Hotline
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right: FAQs List */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                Frequently Asked Questions
                            </h2>
                            <span className="text-xs font-semibold text-slate-500">
                                Showing {filteredFaqs.length} article{filteredFaqs.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {filteredFaqs.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
                                <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                                <p className="text-xs font-semibold">No questions matching "{search}" in this category.</p>
                                <button 
                                    onClick={() => { setSearch(''); setActiveTab('all'); }}
                                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFaqs.map(faq => (
                                    <div 
                                        key={faq.id}
                                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition space-y-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                                                {faq.q}
                                            </h3>
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shrink-0">
                                                {faq.category}
                                            </span>
                                        </div>

                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                            {faq.a}
                                        </p>

                                        {/* Step by step list if available */}
                                        {faq.steps && faq.steps.length > 0 && (
                                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2">
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Step-by-Step Instructions:</p>
                                                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                                    {faq.steps.map((st, i) => (
                                                        <li key={i} className="leading-normal">{st}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )}

                                        {/* Was this helpful feedback */}
                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                                            <span>Was this article helpful?</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleFeedback(faq.id, 'yes')}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                                        feedback[faq.id] === 'yes'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> Yes
                                                </button>
                                                <button
                                                    onClick={() => handleFeedback(faq.id, 'no')}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                                                        feedback[faq.id] === 'no'
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <ThumbsDown className="w-3.5 h-3.5 text-rose-500" /> No
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Video Modal Popup */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
                            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                                <Video className="w-5 h-5 text-indigo-400" />
                                {selectedVideo.title}
                            </h3>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="aspect-video w-full bg-slate-950 flex items-center justify-center">
                            <iframe
                                className="w-full h-full"
                                src={selectedVideo.embedUrl}
                                title={selectedVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950 text-right">
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold rounded-xl hover:bg-slate-300 transition"
                            >
                                Close Video
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Help.layout = (page: any) => <SellerLayout children={page} />;

