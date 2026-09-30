import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Trash, Edit, Save, X, LayoutGrid, Link as LinkIcon, Globe } from 'lucide-react';
import Swal from 'sweetalert2';

interface FooterLink {
    id: number;
    footer_widget_id: number;
    label: string;
    url: string;
    position: number;
    is_active: number;
}

interface FooterWidget {
    id: number;
    title: string;
    position: number;
    is_active: number;
    links: FooterLink[];
}

export default function FooterBuilder({ widgets = [], settings = {} }: { widgets: FooterWidget[], settings: any }) {
    const { data: settingsData, setData: setSettingsData, post: postSettings, processing: settingsProcessing } = useForm({
        footer_facebook: settings?.footer_facebook || '',
        footer_instagram: settings?.footer_instagram || '',
        footer_youtube: settings?.footer_youtube || '',
        footer_linkedin: settings?.footer_linkedin || '',
        footer_tiktok: settings?.footer_tiktok || '',
        footer_pinterest: settings?.footer_pinterest || '',
        footer_whatsapp: settings?.footer_whatsapp || '',
        footer_app_store: settings?.footer_app_store || '',
        footer_play_store: settings?.footer_play_store || '',
        footer_copyright: settings?.footer_copyright || '',
    });

    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [currentWidget, setCurrentWidget] = useState<FooterWidget | null>(null);
    const [currentLink, setCurrentLink] = useState<FooterLink | null>(null);

    const { data: widgetData, setData: setWidgetData, post: postWidget, processing: widgetProcessing, reset: resetWidget } = useForm({
        title: '',
        position: 1,
        is_active: true
    });

    const { data: linkData, setData: setLinkData, post: postLink, processing: linkProcessing, reset: resetLink } = useForm({
        footer_widget_id: 0,
        label: '',
        url: '',
        position: 1,
        is_active: true
    });

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postSettings('/admin/appearance/footer-settings', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'ফুটমার গ্লোবাল সেটিংস সেভ হয়েছে!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
    };

    const handleWidgetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentWidget) {
            router.post(`/admin/appearance/footer-widgets/${currentWidget.id}`, {
                ...widgetData,
                _method: 'PUT'
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsWidgetModalOpen(false);
                    resetWidget();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'ফুটমার কলাম আপডেট সফল হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            postWidget('/admin/appearance/footer-widgets', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsWidgetModalOpen(false);
                    resetWidget();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন ফুটমার কলাম যুক্ত হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentLink) {
            router.post(`/admin/appearance/footer-links/${currentLink.id}`, {
                ...linkData,
                _method: 'PUT'
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLinkModalOpen(false);
                    resetLink();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'ফুটমার লিংক সফলভাবে আপডেট হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        } else {
            postLink('/admin/appearance/footer-links', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsLinkModalOpen(false);
                    resetLink();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'নতুন ফুটমার লিংক যুক্ত হয়েছে!',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            });
        }
    };

    const deleteWidget = (id: number) => {
        Swal.fire({
            title: 'ফুটমার কলাম মুছে ফেলতে চান?',
            text: 'এই কলামের অন্তর্ভুক্ত সকল লিংকসমূহও মুছে যাবে।',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/appearance/footer-widgets/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'কলাম ডিলিট করা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    const deleteLink = (id: number) => {
        Swal.fire({
            title: 'লিংকটি মুছে ফেলতে চান?',
            text: 'এই লিংকটি ফুটার থেকে সরিয়ে ফেলা হবে।',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন',
            cancelButtonText: 'বাতিল'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(`/admin/appearance/footer-links/${id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'লিংক ডিলিট করা হয়েছে!',
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true,
                        });
                    }
                });
            }
        });
    };

    return (
        <>
            <Head title="Footer Builder — Admin" />
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                                Appearance
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-xs font-bold text-slate-500">Footer Customization</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Footer Builder</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            Manage navigation links, columns, and social links displayed at bottom footer.
                        </p>
                    </div>

                    <button 
                        type="button"
                        onClick={() => { setCurrentWidget(null); resetWidget(); setIsWidgetModalOpen(true); }} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-xs cursor-pointer"
                    >
                        <Plus size={16} /> Add Footer Column
                    </button>
                </div>

                {/* Footer Settings */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <h2 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-500" /> Global Footer & Social Settings
                    </h2>
                    <form onSubmit={handleSettingsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Copyright Text</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_copyright} onChange={e => setSettingsData('footer_copyright', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Facebook URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_facebook} onChange={e => setSettingsData('footer_facebook', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Instagram URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_instagram} onChange={e => setSettingsData('footer_instagram', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">YouTube URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_youtube} onChange={e => setSettingsData('footer_youtube', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">LinkedIn URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_linkedin} onChange={e => setSettingsData('footer_linkedin', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">TikTok URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_tiktok} onChange={e => setSettingsData('footer_tiktok', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Pinterest URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_pinterest} onChange={e => setSettingsData('footer_pinterest', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">WhatsApp Number/URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_whatsapp} onChange={e => setSettingsData('footer_whatsapp', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">App Store URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_app_store} onChange={e => setSettingsData('footer_app_store', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Google Play URL</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white" value={settingsData.footer_play_store} onChange={e => setSettingsData('footer_play_store', e.target.value)} />
                        </div>
                        <div className="md:col-span-2 flex justify-end pt-2">
                            <button type="submit" disabled={settingsProcessing} className="bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50">
                                <Save size={16} /> Save Settings
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {widgets.map(widget => (
                        <div key={widget.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                    <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-emerald-500" />
                                        {widget.title} <span className="text-[10px] text-slate-400 font-normal">(Pos: {widget.position})</span>
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            type="button"
                                            onClick={() => { 
                                                setCurrentWidget(widget); 
                                                setWidgetData({ title: widget.title, position: widget.position, is_active: widget.is_active === 1 }); 
                                                setIsWidgetModalOpen(true); 
                                            }} 
                                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition cursor-pointer"
                                            title="Edit Column"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => deleteWidget(widget.id)} 
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer"
                                            title="Delete Column"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
                                <ul className="space-y-2 mb-4">
                                    {(widget.links || []).map(link => (
                                        <li key={link.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                                                {link.label}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    type="button"
                                                    onClick={() => { 
                                                        setCurrentLink(link); 
                                                        setLinkData({ 
                                                            footer_widget_id: widget.id, 
                                                            label: link.label, 
                                                            url: link.url, 
                                                            position: link.position, 
                                                            is_active: link.is_active === 1 
                                                        }); 
                                                        setIsLinkModalOpen(true); 
                                                    }} 
                                                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition cursor-pointer"
                                                    title="Edit Link"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => deleteLink(link.id)} 
                                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md transition cursor-pointer"
                                                    title="Delete Link"
                                                >
                                                    <Trash size={14} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button 
                                type="button"
                                onClick={() => { 
                                    setCurrentLink(null); 
                                    resetLink(); 
                                    setLinkData({
                                        footer_widget_id: widget.id,
                                        label: '',
                                        url: '',
                                        position: (widget.links?.length || 0) + 1,
                                        is_active: true
                                    }); 
                                    setIsLinkModalOpen(true); 
                                }} 
                                className="w-full py-2 border border-dashed border-emerald-400 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition cursor-pointer"
                            >
                                + Add Link
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Widget Column Modal */}
            {isWidgetModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-emerald-500" />
                                {currentWidget ? 'Edit Footer Column' : 'Add Footer Column'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsWidgetModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleWidgetSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Column Title <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white transition" 
                                    value={widgetData.title} 
                                    onChange={e => setWidgetData('title', e.target.value)} 
                                    placeholder="e.g. COMPANY, HELP & SUPPORT"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Position Order
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white transition" 
                                    value={widgetData.position} 
                                    onChange={e => setWidgetData('position', parseInt(e.target.value) || 0)} 
                                />
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={widgetData.is_active} 
                                        onChange={e => setWidgetData('is_active', e.target.checked)} 
                                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Column</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button" 
                                    onClick={() => setIsWidgetModalOpen(false)} 
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={widgetProcessing} 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {widgetProcessing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Link Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-emerald-500" />
                                {currentLink ? 'Edit Link' : 'Add Link'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleLinkSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Label <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white transition" 
                                    value={linkData.label} 
                                    onChange={e => setLinkData('label', e.target.value)} 
                                    placeholder="e.g. Contact Us, Privacy Policy"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    URL / Path <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold font-mono focus:ring-2 focus:ring-emerald-500 dark:text-white transition" 
                                    value={linkData.url} 
                                    onChange={e => setLinkData('url', e.target.value)} 
                                    placeholder="e.g. /page/contact-us or https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Position
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 dark:text-white transition" 
                                    value={linkData.position} 
                                    onChange={e => setLinkData('position', parseInt(e.target.value) || 0)} 
                                />
                            </div>
                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={linkData.is_active} 
                                        onChange={e => setLinkData('is_active', e.target.checked)} 
                                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Link</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    type="button" 
                                    onClick={() => setIsLinkModalOpen(false)} 
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={linkProcessing} 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                                >
                                    {linkProcessing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
