import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { 
    Save, MessageCircle, MonitorSmartphone, Settings2, Palette, Loader2, Check, 
    Headphones, Phone, Mail, Send, ExternalLink, Image, Upload, Trash2, 
    Users, ShoppingBag, Clock, Activity, Zap, Eye, CheckCircle2, ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Props {
    initial_tab?: string;
    widget_settings?: {
        enabled?: string;
        color?: string;
        position?: string;
        greeting?: string;
        whatsapp?: string;
        messenger?: string;
        phone?: string;
        email?: string;
        whatsapp_icon?: string | null;
        messenger_icon?: string | null;
        livechat_icon?: string | null;
    };
    social_proof_settings?: {
        enabled?: string;
        interval_seconds?: number;
        duration_seconds?: number;
    };
    live_visitor_settings?: {
        mode?: string;
        label_text?: string;
        prefix_text?: string;
        suffix_text?: string;
        min_count?: number;
        max_count?: number;
        base_count?: number;
    };
}

export default function FloatingWidget({
    initial_tab = 'support_widget',
    widget_settings,
    social_proof_settings,
    live_visitor_settings,
}: Props) {
    const [activeTab, setActiveTab] = useState<'support_widget' | 'social_proof' | 'live_visitors'>(
        (initial_tab as any) || 'support_widget'
    );

    const { data, setData, post, processing } = useForm<{
        // Support Widget
        enabled: string;
        color: string;
        position: string;
        greeting: string;
        whatsapp: string;
        messenger: string;
        phone: string;
        email: string;
        whatsapp_icon: File | null;
        messenger_icon: File | null;
        livechat_icon: File | null;
        // Social Proof
        social_proof_enabled: string;
        social_proof_interval_seconds: number;
        social_proof_duration_seconds: number;
        // Live Visitor
        live_visitor_mode: string;
        live_visitor_label_text: string;
        live_visitor_prefix_text: string;
        live_visitor_suffix_text: string;
        live_visitor_min_count: number;
        live_visitor_max_count: number;
        live_visitor_base_count: number;
    }>({
        enabled:        widget_settings?.enabled   !== undefined ? String(widget_settings.enabled) : '1',
        color:          widget_settings?.color     || '#4f46e5',
        position:       widget_settings?.position  || 'bottom-right',
        greeting:       widget_settings?.greeting  || '২৪/৭ কাস্টমার সাপোর্ট — যেকোনো প্রয়োজনে আমরা আপনার সাথে আছি!',
        whatsapp:       widget_settings?.whatsapp  || '+8801982708789',
        messenger:      widget_settings?.messenger || 'guruzbd',
        phone:          widget_settings?.phone     || '01700000000',
        email:          widget_settings?.email     || 'support@guruz.com.bd',
        whatsapp_icon:  null,
        messenger_icon: null,
        livechat_icon:  null,

        social_proof_enabled:          social_proof_settings?.enabled !== undefined ? String(social_proof_settings.enabled) : '1',
        social_proof_interval_seconds: Number(social_proof_settings?.interval_seconds || 20),
        social_proof_duration_seconds: Number(social_proof_settings?.duration_seconds || 6),

        live_visitor_mode:        live_visitor_settings?.mode || 'virtual',
        live_visitor_label_text:  live_visitor_settings?.label_text || 'LIVE',
        live_visitor_prefix_text: live_visitor_settings?.prefix_text !== undefined ? live_visitor_settings.prefix_text : '🔴',
        live_visitor_suffix_text: live_visitor_settings?.suffix_text || '',
        live_visitor_min_count:   Number(live_visitor_settings?.min_count || 250),
        live_visitor_max_count:   Number(live_visitor_settings?.max_count || 500),
        live_visitor_base_count:  Number(live_visitor_settings?.base_count || 350),
    });

    const [whatsappPreview, setWhatsappPreview] = useState<string | null>(widget_settings?.whatsapp_icon || null);
    const [messengerPreview, setMessengerPreview] = useState<string | null>(widget_settings?.messenger_icon || null);
    const [livechatPreview, setLivechatPreview] = useState<string | null>(widget_settings?.livechat_icon || null);

    const handleFileChange = (field: 'whatsapp_icon' | 'messenger_icon' | 'livechat_icon', file: File | null) => {
        if (!file) return;
        setData(field, file);
        const url = URL.createObjectURL(file);
        if (field === 'whatsapp_icon') setWhatsappPreview(url);
        if (field === 'messenger_icon') setMessengerPreview(url);
        if (field === 'livechat_icon') setLivechatPreview(url);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/support/floating-widget', {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    title: 'সফলভাবে সেভ হয়েছে!',
                    text: 'সমস্ত সেটিংস ও লাইভ কনফিগারেশন সফলভাবে আপডেট করা হয়েছে।',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            },
            onError: (errors) => {
                Swal.fire({
                    title: 'ত্রুটি!',
                    text: Object.values(errors).join(', ') || 'সেভ করতে সমস্যা হয়েছে।',
                    icon: 'error',
                });
            }
        });
    };

    return (
        <>
            <Head title="Floating Widget, Social Proof & Live Visitor Settings — Admin" />

            <div className="space-y-6 max-w-full pb-12">
                
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Customer Engagement Control
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Live Support & Social Proof</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                            Widget, Social Proof & Live Visitor Settings
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            কাস্টমার সাপোর্ট উইজেট, রিসেন্ট পারচেজ সোশ্যাল প্রুফ পপআপের সময় ব্যবধান এবং হেডার লাইভ ভিজিটরের সংখ্যা এখান থেকে নিয়ন্ত্রণ করুন।
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={processing}
                            className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 disabled:opacity-60 text-white text-xs font-black px-6 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{processing ? 'সেভ হচ্ছে...' : 'সেভ করুন (Save Changes)'}</span>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation Header */}
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveTab('support_widget')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer shrink-0 ${
                            activeTab === 'support_widget'
                                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Headphones size={15} />
                        <span>১. কাস্টমার সাপোর্ট ফ্লোটিং বাটন</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('social_proof')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer shrink-0 ${
                            activeTab === 'social_proof'
                                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <ShoppingBag size={15} />
                        <span>২. 🛍️ রিসেন্ট পারচেজ পপআপ (কয় মিনিট পর পর আসবে)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('live_visitors')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition cursor-pointer shrink-0 ${
                            activeTab === 'live_visitors'
                                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Activity size={15} />
                        <span>৩. 🔴 হেডার লাইভ ভিজিটর সংখ্যা (কত থেকে কত)</span>
                    </button>
                </div>

                {/* TAB 1: SUPPORT FLOATING WIDGET */}
                {activeTab === 'support_widget' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
                        {/* Settings Form (7 Cols) */}
                        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
                            
                            {/* Status Card */}
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">সাপোর্ট বাটন স্ট্যাটাস</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">ওয়েবসাইটে ভাসমান সাপোর্ট বাটন প্রদর্শন চালু বা বন্ধ করুন</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('enabled', data.enabled === '1' ? '0' : '1')}
                                    className={`w-12 h-7 flex items-center rounded-full p-1 transition cursor-pointer ${data.enabled === '1' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${data.enabled === '1' ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {/* Logos & Icons */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Image className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        Platform Logos & Icons (লোগো আপলোড ও পরিবর্তন)
                                    </h2>
                                </div>
                                
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* WhatsApp Logo */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md p-2 relative overflow-hidden">
                                            {whatsappPreview ? (
                                                <img src={whatsappPreview} alt="WhatsApp" className="w-full h-full object-contain" />
                                            ) : (
                                                <MessageCircle className="w-7 h-7 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">হোয়াটসঅ্যাপ লোগো</h4>
                                            <p className="text-[10px] text-slate-500">PNG / SVG / JPG</p>
                                        </div>
                                        <label className="cursor-pointer bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-2xs transition">
                                            <Upload className="w-3 h-3" />
                                            <span>আপলোড</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => handleFileChange('whatsapp_icon', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>

                                    {/* Messenger Logo */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-[#0084FF] flex items-center justify-center text-white shadow-md p-2 relative overflow-hidden">
                                            {messengerPreview ? (
                                                <img src={messengerPreview} alt="Messenger" className="w-full h-full object-contain" />
                                            ) : (
                                                <Send className="w-7 h-7 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">মেসেঞ্জার লোগো</h4>
                                            <p className="text-[10px] text-slate-500">PNG / SVG / JPG</p>
                                        </div>
                                        <label className="cursor-pointer bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-2xs transition">
                                            <Upload className="w-3 h-3" />
                                            <span>আপলোড</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => handleFileChange('messenger_icon', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>

                                    {/* Live Chat Logo */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md p-2 relative overflow-hidden">
                                            {livechatPreview ? (
                                                <img src={livechatPreview} alt="Live Chat" className="w-full h-full object-contain" />
                                            ) : (
                                                <Headphones className="w-7 h-7 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-800 dark:text-white">লাইভ চ্যাট লোগো</h4>
                                            <p className="text-[10px] text-slate-500">PNG / SVG / JPG</p>
                                        </div>
                                        <label className="cursor-pointer bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 shadow-2xs transition">
                                            <Upload className="w-3 h-3" />
                                            <span>আপলোড</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={e => handleFileChange('livechat_icon', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Appearance & Positioning</h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">উইজেট আইকন কালার</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={data.color}
                                                onChange={e => setData('color', e.target.value)}
                                                className="w-11 h-11 rounded-2xl cursor-pointer border border-slate-200 p-0.5 bg-white shadow-xs"
                                            />
                                            <input
                                                type="text"
                                                value={data.color}
                                                onChange={e => setData('color', e.target.value)}
                                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500 dark:text-white uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Widget Position</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className={`border ${data.position === 'bottom-left' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40' : 'border-slate-200 dark:border-slate-700'} rounded-2xl p-4 cursor-pointer transition relative`}>
                                                <input type="radio" name="position" value="bottom-left" checked={data.position === 'bottom-left'} onChange={() => setData('position', 'bottom-left')} className="sr-only" />
                                                <div className="font-black text-xs text-slate-800 dark:text-white text-center">Bottom Left (বামে নিচে)</div>
                                                {data.position === 'bottom-left' && <Check className="absolute top-2.5 right-2.5 w-4 h-4 text-indigo-600" />}
                                            </label>
                                            <label className={`border ${data.position === 'bottom-right' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40' : 'border-slate-200 dark:border-slate-700'} rounded-2xl p-4 cursor-pointer transition relative`}>
                                                <input type="radio" name="position" value="bottom-right" checked={data.position === 'bottom-right'} onChange={() => setData('position', 'bottom-right')} className="sr-only" />
                                                <div className="font-black text-xs text-slate-800 dark:text-white text-center">Bottom Right (ডানে নিচে)</div>
                                                {data.position === 'bottom-right' && <Check className="absolute top-2.5 right-2.5 w-4 h-4 text-indigo-600" />}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Links */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Settings2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">সাপোর্ট চ্যানেল ও তথ্য</h2>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">শুভেচ্ছা বার্তা (Greeting)</label>
                                        <input
                                            type="text"
                                            value={data.greeting}
                                            onChange={e => setData('greeting', e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">WhatsApp নম্বর</label>
                                            <input
                                                type="text"
                                                value={data.whatsapp}
                                                onChange={e => setData('whatsapp', e.target.value)}
                                                placeholder="+8801982708789"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">হটলাইন নম্বর</label>
                                            <input
                                                type="text"
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                placeholder="01700000000"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Messenger পেজ / ইউজারনেম</label>
                                            <input
                                                type="text"
                                                value={data.messenger}
                                                onChange={e => setData('messenger', e.target.value)}
                                                placeholder="guruzbd"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">ইমেইল ঠিকানা</label>
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                placeholder="support@guruz.com.bd"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Interactive Preview */}
                        <div className="lg:col-span-5 sticky top-24">
                            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[520px]">
                                <div className="p-4 border-b border-slate-800 flex items-center justify-between text-slate-300 bg-slate-950/60">
                                    <div className="flex items-center gap-2">
                                        <MonitorSmartphone className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs font-black uppercase tracking-wider">সাপোর্ট বাটন লাইভ প্রিভিউ</span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${data.enabled === '1' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                        {data.enabled === '1' ? 'Active' : 'Disabled'}
                                    </span>
                                </div>

                                <div className="flex-1 relative bg-slate-950/90 p-5 overflow-hidden flex flex-col justify-end">
                                    {data.enabled === '1' ? (
                                        <div className={`relative z-10 flex flex-col ${data.position === 'bottom-left' ? 'items-start' : 'items-end'} gap-3`}>
                                            <div className="bg-slate-800 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 max-w-[250px]">
                                                {data.greeting || '২৪/৭ কাস্টমার সাপোর্ট'}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0084FF] text-white text-xs font-black rounded-xl shadow">
                                                    <Send size={13} />
                                                    <span>মেসেঞ্জার: {data.messenger || 'guruzbd'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366] text-white text-xs font-black rounded-xl shadow">
                                                    <MessageCircle size={13} />
                                                    <span>হোয়াটসঅ্যাপ: {data.whatsapp || '+8801982708789'}</span>
                                                </div>
                                            </div>
                                            <div 
                                                className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white border-2 border-white/30"
                                                style={{ backgroundColor: data.color }}
                                            >
                                                <Headphones className="w-7 h-7" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-500 text-xs font-bold">
                                            উইজেট বর্তমানে বন্ধ আছে
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: SOCIAL PROOF RECENT PURCHASE TOAST TIMING */}
                {activeTab === 'social_proof' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
                        {/* Settings (7 Cols) */}
                        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
                            
                            {/* Toggle Active */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                            রিসেন্ট পারচেজ নোটিফিকেশন (Social Proof Toast)
                                        </h3>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        স্ক্রিনের নিচের বাম পাশে স্বয়ংক্রিয়ভাবে সাম্প্রতিক ক্রয়ের তথ্য প্রদর্শন
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('social_proof_enabled', data.social_proof_enabled === '1' ? '0' : '1')}
                                    className={`w-12 h-7 flex items-center rounded-full p-1 transition cursor-pointer ${data.social_proof_enabled === '1' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${data.social_proof_enabled === '1' ? 'translate-x-5' : ''}`} />
                                </button>
                            </div>

                            {/* Interval Frequency Control */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        পপআপ খোলার সময় ব্যবধান (Interval Frequency)
                                    </h2>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-xs font-black text-slate-800 dark:text-white mb-2">
                                            কয় মিনিট বা সেকেন্ড পর পর নতুন পপআপ প্রদর্শিত হবে?
                                        </label>
                                        
                                        {/* Quick Preset Buttons */}
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                                            {[
                                                { label: '১০ সেকেন্ড', val: 10 },
                                                { label: '২০ সেকেন্ড', val: 20 },
                                                { label: '৩০ সেকেন্ড', val: 30 },
                                                { label: '১ মিনিট', val: 60 },
                                                { label: '২ মিনিট', val: 120 },
                                                { label: '৫ মিনিট', val: 300 },
                                            ].map((preset) => (
                                                <button
                                                    key={preset.val}
                                                    type="button"
                                                    onClick={() => setData('social_proof_interval_seconds', preset.val)}
                                                    className={`py-2 px-2 text-center text-xs font-black rounded-xl border transition cursor-pointer ${
                                                        data.social_proof_interval_seconds === preset.val
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50'
                                                    }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="2"
                                                max="3600"
                                                value={data.social_proof_interval_seconds}
                                                onChange={e => setData('social_proof_interval_seconds', Number(e.target.value))}
                                                className="w-36 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                সেকেন্ড পর পর (বা {Math.round(data.social_proof_interval_seconds / 60 * 10) / 10} মিনিট)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Display Duration */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <label className="block text-xs font-black text-slate-800 dark:text-white mb-2">
                                            প্রতিবার পপআপ স্ক্রিনে কত সেকেন্ড দৃশ্যমান থাকবে? (Duration)
                                        </label>
                                        
                                        <div className="grid grid-cols-4 gap-2 mb-3 max-w-sm">
                                            {[
                                                { label: '৪ সেকেন্ড', val: 4 },
                                                { label: '৬ সেকেন্ড (স্ট্যান্ডার্ড)', val: 6 },
                                                { label: '৮ সেকেন্ড', val: 8 },
                                                { label: '১০ সেকেন্ড', val: 10 },
                                            ].map((dur) => (
                                                <button
                                                    key={dur.val}
                                                    type="button"
                                                    onClick={() => setData('social_proof_duration_seconds', dur.val)}
                                                    className={`py-2 px-2 text-center text-xs font-black rounded-xl border transition cursor-pointer ${
                                                        data.social_proof_duration_seconds === dur.val
                                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {dur.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                min="2"
                                                max="60"
                                                value={data.social_proof_duration_seconds}
                                                onChange={e => setData('social_proof_duration_seconds', Number(e.target.value))}
                                                className="w-36 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                            />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                সেকেন্ড স্থায়ী থাকবে
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Interactive Toast Preview (5 Cols) */}
                        <div className="lg:col-span-5 sticky top-24">
                            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[520px]">
                                <div className="p-4 border-b border-slate-800 flex items-center justify-between text-slate-300 bg-slate-950/60">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-black uppercase tracking-wider">Social Proof টোস্ট প্রিভিউ</span>
                                    </div>
                                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                                        প্রতি {data.social_proof_interval_seconds}s পর পর
                                    </span>
                                </div>

                                <div className="flex-1 relative bg-slate-950/90 p-5 overflow-hidden flex flex-col justify-end">
                                    {/* Simulated Toast Component */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-2xl border border-slate-200 dark:border-slate-800 max-w-[340px] animate-in slide-in-from-left-4 fade-in">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-1">
                                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                                        ফারহানা ইয়াসমিন <span className="text-slate-400 font-semibold">(রাজশাহী)</span>
                                                    </h4>
                                                    <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/60 rounded shrink-0">
                                                        ৭ মিনিট পূর্বে
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                                                    শপ: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">Cable World</span>
                                                </p>
                                                <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                                    📦 ৪.০ আরএম হেভি ডিউটি পাওয়ার ক্যাবল...
                                                </p>
                                                <div className="flex items-center justify-between mt-1 text-[10px]">
                                                    <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                                                        <CheckCircle2 size={11} /> অর্ডার সম্পন্ন হয়েছে
                                                    </span>
                                                    <span className="text-indigo-600 font-bold underline cursor-pointer">দেখুন ↗</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-center text-slate-500 mt-4">
                                        ⏱️ এটি স্ক্রিনে {data.social_proof_duration_seconds} সেকেন্ড থাকবে এবং প্রতি {data.social_proof_interval_seconds} সেকেন্ড পর পর নতুন অর্ডারের তথ্য দিয়ে স্বয়ংক্রিয়ভাবে ভেসে উঠবে।
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: HEADER LIVE VISITOR COUNTER RANGE */}
                {activeTab === 'live_visitors' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
                        {/* Settings (7 Cols) */}
                        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
                            
                            {/* Mode Selection */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Activity className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        লাইভ কাউন্টার অপারেটিং মোড (Counter Mode)
                                    </h2>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Virtual Dynamic Mode */}
                                        <label className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex flex-col gap-1.5 ${
                                            data.live_visitor_mode === 'virtual'
                                                ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 shadow-xs'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="live_visitor_mode"
                                                value="virtual"
                                                checked={data.live_visitor_mode === 'virtual'}
                                                onChange={() => setData('live_visitor_mode', 'virtual')}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                                                    <Zap size={14} /> ভার্চুয়াল সিমুলেশন (প্রস্তাবিত)
                                                </span>
                                                {data.live_visitor_mode === 'virtual' && <Check className="w-4 h-4 text-rose-600" />}
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                আপনার নির্ধারিত সর্বনিম্ন ও সর্বোচ্চ রেঞ্জের মধ্যে স্বয়ংক্রিয়ভাবে ওঠানামা করবে।
                                            </p>
                                        </label>

                                        {/* Real DB Mode */}
                                        <label className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex flex-col gap-1.5 ${
                                            data.live_visitor_mode === 'real'
                                                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                        }`}>
                                            <input
                                                type="radio"
                                                name="live_visitor_mode"
                                                value="real"
                                                checked={data.live_visitor_mode === 'real'}
                                                onChange={() => setData('live_visitor_mode', 'real')}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center justify-between">
                                                <span className="font-black text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                                    <Users size={14} /> প্রকৃত ডাটাবেজ ট্র্যাকিং
                                                </span>
                                                {data.live_visitor_mode === 'real' && <Check className="w-4 h-4 text-emerald-600" />}
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                                গত ৫ মিনিটে ওয়েবসাইটে সক্রিয় থাকা রিয়েল আইপি (IP Address) ভিজিটর সংখ্যা গণনা করবে।
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Custom Badge Text Settings */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Activity className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        লাইভ ব্যাজের টেক্সট ও আইকন কাস্টমাইজেশন (Custom Text & Label)
                                    </h2>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Prefix Icon */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                প্রিফিক্স আইকন / ইমোজি
                                            </label>
                                            <input
                                                type="text"
                                                value={data.live_visitor_prefix_text}
                                                onChange={e => setData('live_visitor_prefix_text', e.target.value)}
                                                placeholder="🔴"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                            />
                                            <div className="flex gap-1.5 mt-1.5">
                                                {['🔴', '⚡', '👥', '🔥', '⭐'].map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => setData('live_visitor_prefix_text', emoji)}
                                                        className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Label Text */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                লাইভ টাইটেল / টেক্সট
                                            </label>
                                            <input
                                                type="text"
                                                value={data.live_visitor_label_text}
                                                onChange={e => setData('live_visitor_label_text', e.target.value)}
                                                placeholder="LIVE"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                            />
                                            <div className="flex gap-1.5 mt-1.5">
                                                {['LIVE', 'লাইভ', 'অনলাইন', 'Active'].map(lbl => (
                                                    <button
                                                        key={lbl}
                                                        type="button"
                                                        onClick={() => setData('live_visitor_label_text', lbl)}
                                                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                                                    >
                                                        {lbl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Suffix Text */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                                সাফিক্স একক / টেক্সট (ঐচ্ছিক)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.live_visitor_suffix_text}
                                                onChange={e => setData('live_visitor_suffix_text', e.target.value)}
                                                placeholder="জন / Online"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                            />
                                            <div className="flex gap-1.5 mt-1.5">
                                                {['জন', 'Users', 'Online', ''].map(sfx => (
                                                    <button
                                                        key={sfx || 'খালি'}
                                                        type="button"
                                                        onClick={() => setData('live_visitor_suffix_text', sfx)}
                                                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                                                    >
                                                        {sfx || 'খালি'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Range Controls: Min & Max Count */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                                <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-2.5 bg-slate-50/50 dark:bg-slate-900/50">
                                    <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                    <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        ভিজিটর সংখ্যা নির্ধারণ (Min & Max Range Setting)
                                    </h2>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Min Count */}
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                                            <label className="block text-xs font-black text-slate-800 dark:text-white">
                                                সর্বনিম্ন ভিজিটর সংখ্যা (Minimum Count)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={data.live_visitor_min_count}
                                                onChange={e => setData('live_visitor_min_count', Number(e.target.value))}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                            />
                                            <p className="text-[10px] text-slate-400">যেমন: 200 বা 250</p>
                                        </div>

                                        {/* Max Count */}
                                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                                            <label className="block text-xs font-black text-slate-800 dark:text-white">
                                                সর্বোচ্চ ভিজিটর সংখ্যা (Maximum Count)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={data.live_visitor_max_count}
                                                onChange={e => setData('live_visitor_max_count', Number(e.target.value))}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                            />
                                            <p className="text-[10px] text-slate-400">যেমন: 450 বা 500</p>
                                        </div>
                                    </div>

                                    {/* Default / Base count */}
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                                        <label className="block text-xs font-black text-slate-800 dark:text-white">
                                            বেস বা ডিফল্ট ভিজিটর সংখ্যা (Base / Fixed Digit)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.live_visitor_base_count}
                                            onChange={e => setData('live_visitor_base_count', Number(e.target.value))}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                                        />
                                        <p className="text-[10px] text-slate-400">
                                            পেজ লোডের সাথে সাথে এই বেস ডিজিটের আশেপাশে ({data.live_visitor_min_count} থেকে {data.live_visitor_max_count} এর মধ্যে) সংখ্যাটি প্রদর্শিত হবে এবং প্রাকৃতিক গতিতে ওঠানামা করবে।
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Interactive Header Counter Preview (5 Cols) */}
                        <div className="lg:col-span-5 sticky top-24">
                            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[520px]">
                                <div className="p-4 border-b border-slate-800 flex items-center justify-between text-slate-300 bg-slate-950/60">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-rose-400" />
                                        <span className="text-xs font-black uppercase tracking-wider">হেডার লাইভ ব্যাজ প্রিভিউ</span>
                                    </div>
                                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                                        {data.live_visitor_min_count} – {data.live_visitor_max_count}
                                    </span>
                                </div>

                                <div className="flex-1 relative bg-slate-950/90 p-6 overflow-hidden flex flex-col items-center justify-center gap-6">
                                    {/* Header Badge Simulation */}
                                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center px-4 py-1.5 rounded-xl border border-red-500/40 bg-red-500/20 shadow-md">
                                            <span className="flex items-center gap-1.5 text-[11px] font-black text-red-400 uppercase tracking-widest">
                                                {data.live_visitor_prefix_text ? (
                                                    <span>{data.live_visitor_prefix_text}</span>
                                                ) : (
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                    </span>
                                                )}
                                                {data.live_visitor_label_text || 'LIVE'}
                                            </span>
                                            <span className="text-base font-black text-white tracking-wider leading-none mt-1">
                                                {Math.round((data.live_visitor_min_count + data.live_visitor_max_count) / 2)}
                                                {data.live_visitor_suffix_text ? ` ${data.live_visitor_suffix_text}` : ''}
                                            </span>
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-xs font-black text-white">হেডার লাইভ কাউন্টার</h4>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                রেঞ্জ: {data.live_visitor_min_count} থেকে {data.live_visitor_max_count}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-slate-300 text-xs space-y-2 max-w-sm">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 font-bold">সিলেক্টেড মোড:</span>
                                            <span className="font-black text-rose-400">
                                                {data.live_visitor_mode === 'virtual' ? 'ভার্চুয়াল সিমুলেশন ⚡' : 'প্রকৃত ডাটাবেজ ভিজিটর 👥'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 font-bold">কাস্টম টেক্সট:</span>
                                            <span className="font-black text-white">
                                                {data.live_visitor_prefix_text} {data.live_visitor_label_text} {data.live_visitor_suffix_text}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 font-bold">সর্বনিম্ন সীমা (Min):</span>
                                            <span className="font-black text-white">{data.live_visitor_min_count} জন</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 font-bold">সর্বোচ্চ সীমা (Max):</span>
                                            <span className="font-black text-white">{data.live_visitor_max_count} জন</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}