import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { MobileBottomNav } from '@/Components/MobileBottomNav';
import { ProductCard, Product } from '@/Components/ProductCard';
import { 
    Store, Star, Users, CheckCircle2, MessageCircle, 
    Search, Award, ShieldCheck, Heart, Grid3x3, ThumbsUp,
    Send, X, HelpCircle, CheckCheck, Check
} from 'lucide-react';
import { toast } from 'sonner';

interface Shop {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
    banner_url?: string;
    description?: string;
    rating: number;
    followers_count?: number;
    commission_rate?: number;
    created_at?: string;
}

interface ShopShowProps {
    shop: Shop;
    products: {
        data: Product[];
    };
    isFollowing?: boolean;
    followersCount?: number;
    whatsappNumber?: string;
    auth?: {
        user?: any;
    };
}

export default function Show({ 
    shop, 
    products, 
    isFollowing: initialIsFollowing, 
    followersCount: initialFollowersCount,
    whatsappNumber = '8801700000000'
}: ShopShowProps) {
    const { auth } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState<'products' | 'about'>('products');
    const [search, setSearch] = useState('');
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing ?? false);
    const [followers, setFollowers] = useState(initialFollowersCount ?? shop.followers_count ?? 0);
    const [loadingFollow, setLoadingFollow] = useState(false);

    // Messenger style WhatsApp Chat Window State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<Array<{ id: number; sender: 'shop' | 'user'; text: string; time: string }>>([
        {
            id: 1,
            sender: 'shop',
            text: `আসসালামু আলাইকুম! 👋\n"${shop.name}"-এ আপনাকে স্বাগতম। আপনি কি কোনো পণ্যের স্টক বা বিস্তারিত তথ্য জানতে চান? নিচে মেসেজ লিখে পাঠান, সরাসরি আমাদের হোয়াটসঅ্যাপে চলে যাবে!`,
            time: 'এখনই'
        }
    ]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isChatOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isChatOpen]);

    const quickQuestions = [
        '📦 এই প্রোডাক্টের স্টক এভেইলেবল আছে কি?',
        '🚚 ডেলিভারি চার্জ কত এবং কতদিনে পাবো?',
        '💳 ক্যাশ অন ডেলিভারি (COD) সুবিধা আছে কি?',
        '🛍️ এই শপ থেকে একটি অর্ডার করতে চাই।'
    ];

    const handleSendMessage = (customText?: string) => {
        const textToSend = (customText || chatInput).trim();
        if (!textToSend) return;

        const timeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
        
        // Add user message to state
        setChatMessages(prev => [
            ...prev,
            { id: Date.now(), sender: 'user', text: textToSend, time: timeStr }
        ]);
        setChatInput('');

        // 1. Save message to database — goes to Vendor panel + Super Admin
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            fetch(`/api/shops/${shop.id}/customer-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ message: textToSend }),
            });
        } catch (e) {}

        // 2. Also open WhatsApp in new tab / app
        const targetPhone = whatsappNumber || '8801700000000';
        const shopUrl = typeof window !== 'undefined' ? window.location.href : '';
        const formattedMessage = `আসসালামু আলাইকুম!\nআমি আপনার শপ (${shop.name}) থেকে যোগাযোগ করছি।\n\n💬 মেসেজ: ${textToSend}\n\n🔗 শপ পেজ: ${shopUrl}`;

        const waLink = `https://wa.me/${targetPhone}?text=${encodeURIComponent(formattedMessage)}`;
        window.open(waLink, '_blank');
    };

    const productList = products?.data ?? [];

    const filteredProducts = productList.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleFollow = () => {
        if (!auth?.user) {
            if (window.confirm('শপটি অনুসরণ (Follow) করতে অনুগ্রহ করে একাউন্ট তৈরি বা লগইন করুন। আপনি কি এখন লগইন পেজে যেতে চান?')) {
                router.visit('/login');
            }
            return;
        }

        setLoadingFollow(true);
        axios.post(`/shops/${shop.id}/follow`)
            .then(res => {
                if (res.data.success) {
                    setIsFollowing(res.data.isFollowing);
                    setFollowers(res.data.followersCount);
                    if (res.data.isFollowing) {
                        toast.success('Following! শপটি ফলো করা হয়েছে ❤️');
                    } else {
                        toast.info('শপটি আনফলো করা হয়েছে।');
                    }
                }
            })
            .catch(err => {
                if (err.response?.status === 401) {
                    if (window.confirm('শপ অনুসরণ (Follow) করতে অনুগ্রহ করে অ্যাকাউন্টে লগইন করুন।')) {
                        router.visit('/login');
                    }
                }
            })
            .finally(() => {
                setLoadingFollow(false);
            });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Head title={`${shop.name} — গুরুজ শপ`} />

            <TopNoticeBar />
            <Header />
            <NoticeMarquee />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                
                {/* Shop Banner & Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    {/* Banner */}
                    <div className="h-40 sm:h-56 w-full bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 relative">
                        {shop.banner_url ? (
                            <img 
                                src={shop.banner_url} 
                                alt={shop.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-3xl sm:text-5xl uppercase tracking-widest">
                                {shop.name}
                            </div>
                        )}
                    </div>

                    {/* Shop Info Header */}
                    <div className="p-4 sm:p-6 relative">
                        {/* Logo Badge */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden absolute -top-10 sm:-top-12 left-4 sm:left-6 flex items-center justify-center bg-slate-100">
                            {shop.logo_url ? (
                                <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl sm:text-3xl font-black text-slate-700 uppercase">
                                    {shop.name.charAt(0)}
                                </span>
                            )}
                        </div>

                        {/* Details & Actions */}
                        <div className="pt-10 sm:pt-0 sm:pl-28 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg sm:text-2xl font-black text-slate-900">
                                        {shop.name}
                                    </h1>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 shrink-0" />
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-semibold">
                                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                        {(Number(shop.rating) || 5.0).toFixed(1)} / 5.0
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        {followers} ফলোয়ার
                                    </span>
                                    <span>•</span>
                                    <span>{productList.length}টি পণ্য</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1 sm:pt-0">
                                <button
                                    onClick={toggleFollow}
                                    disabled={loadingFollow}
                                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isFollowing
                                            ? 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                                    }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <Check className="w-4 h-4 text-emerald-600" />
                                            <span>Following</span>
                                        </>
                                    ) : (
                                        <>
                                            <Heart className="w-4 h-4" />
                                            <span>Follow</span>
                                        </>
                                    )}
                                </button>

                                {/* Messenger style WhatsApp Chat Trigger */}
                                <button
                                    type="button"
                                    onClick={() => setIsChatOpen(prev => !prev)}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                                >
                                    <MessageCircle className="w-4 h-4" /> মেসেজ দিন
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-t border-slate-200 bg-slate-50 text-xs font-bold px-4">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'products' ? 'border-emerald-600 text-emerald-700 font-black' : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Grid3x3 className="w-4 h-4" /> সমস্ত পণ্য ({productList.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'about' ? 'border-emerald-600 text-emerald-700 font-black' : 'border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Store className="w-4 h-4" /> শপ তথ্য
                        </button>
                    </div>
                </div>

                {/* Tab 1: Products Grid */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
                            <h2 className="font-extrabold text-xs sm:text-sm text-slate-800">
                                {shop.name} এর পণ্য তালিকা
                            </h2>

                            <div className="w-48 sm:w-64 relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="শপের মধ্যে খুঁজুন..."
                                    className="w-full pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                            </div>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {filteredProducts.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center flex flex-col items-center justify-center">
                                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-400 border border-slate-100">
                                    <Grid3x3 className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">বর্তমানে কোনো পণ্য নেই</h3>
                                <p className="text-xs text-slate-500 max-w-sm">
                                    এই শপটিতে এখনও কোনো প্রোডাক্ট যুক্ত করা হয়নি। নতুন প্রোডাক্ট যুক্ত হলে তা এখানে প্রদর্শিত হবে।
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 2: About Shop */}
                {activeTab === 'about' && (
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
                        <h2 className="font-extrabold text-base text-slate-900 border-b pb-2">
                            {shop.name} সম্পর্কিত তথ্য
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {shop.description || 'এই মার্চেন্ট শপটি গুরুজ প্ল্যাটফর্মে ১০০% অরিজিনাল অফিশিয়াল গ্যাজেট ও ইলেকট্রনিক্স এক্সেসরিজ সরাসরি কাস্টমারদের কাছে পৌঁছাতে প্রতিশ্রুতিবদ্ধ।'}
                        </p>
                    </div>
                )}

            </main>

            {/* Messenger-like WhatsApp Floating Chat Window */}
            {isChatOpen && (
                <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-[330px] sm:w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
                    
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 p-3.5 text-white flex items-center justify-between shrink-0 shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center font-black text-sm uppercase shadow-sm overflow-hidden border border-white/40">
                                    {shop.logo_url ? (
                                        <img src={shop.logo_url} alt={shop.name} className="w-full h-full object-cover" />
                                    ) : (
                                        shop.name.charAt(0)
                                    )}
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
                            </div>
                            <div>
                                <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 leading-tight">
                                    <span className="truncate max-w-[170px]">{shop.name}</span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                                </div>
                                <div className="text-[10px] text-white/80 font-medium flex items-center gap-1 mt-0.5">
                                    <span>সাধারণত কয়েক মিনিটে উত্তর দেয়</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* WhatsApp Tag Badge */}
                            <div className="flex items-center gap-1 bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                                <svg className="w-3 h-3 fill-current text-white shrink-0" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                                <span>WhatsApp</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsChatOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-lg transition text-white cursor-pointer"
                                title="বন্ধ করুন"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="h-72 overflow-y-auto p-3.5 space-y-3 bg-slate-50 text-xs">
                        
                        {/* Day indicator */}
                        <div className="flex justify-center">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                                আজ
                            </span>
                        </div>

                        {chatMessages.map(msg => (
                            <div 
                                key={msg.id} 
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                                        msg.sender === 'user'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-xs'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                                    <span>{msg.time}</span>
                                    {msg.sender === 'user' && (
                                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Quick Questions Chips */}
                        <div className="pt-2">
                            <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                                <HelpCircle className="w-3 h-3 text-amber-500" /> দ্রুত প্রশ্ন বাছাই করুন:
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {quickQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSendMessage(q)}
                                        className="text-left text-[11px] font-semibold bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 p-2 rounded-xl border border-slate-200 transition shadow-2xs cursor-pointer flex items-center justify-between group"
                                    >
                                        <span>{q}</span>
                                        <Send className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-600 transition shrink-0 ml-1" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input Footer */}
                    <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-1.5 shrink-0">
                        <form 
                            onSubmit={e => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="হোয়াটসঅ্যাপে মেসেজ লিখুন..."
                                className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 transition"
                            />
                            <button
                                type="submit"
                                disabled={!chatInput.trim()}
                                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer text-xs shrink-0"
                                title="হোয়াটসঅ্যাপে পাঠান"
                            >
                                <svg className="w-3.5 h-3.5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                </svg>
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </form>
                        <div className="text-[10px] text-slate-400 text-center font-medium">
                            🔒 মেসেজ পাঠালে সরাসরি হোয়াটসঅ্যাপ অ্যাপে চ্যাট ওপেন হবে
                        </div>
                    </div>

                </div>
            )}

            <Footer />
            <MobileBottomNav />
        </div>
    );
}
