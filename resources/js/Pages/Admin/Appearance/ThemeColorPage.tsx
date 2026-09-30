import React, { useState, useMemo } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Palette, Save, RotateCcw, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { InteractiveColorPicker } from '@/Components/InteractiveColorPicker';

interface ThemeSettings {
    primary_color: string;
    primary_dark: string;
    primary_text: string;
    accent_color: string;
    badge_bg: string;
    sale_bg: string;
    navy_color: string;
    header_bg: string;
    header_text: string;
    search_bg: string;
    search_text: string;
    announcement_bg: string;
    announcement_text: string;
    notice_from: string;
    notice_via: string;
    notice_to: string;
    notice_text: string;
    footer_bg: string;
    footer_text: string;
    page_bg: string;
    page_text: string;
    card_bg: string;
    card_text: string;
    popover_bg: string;
    popover_text: string;
    secondary_bg: string;
    secondary_text: string;
    accent_bg: string;
    accent_text: string;
    muted_bg: string;
    muted_text: string;
    border_color: string;
    input_border: string;
    focus_ring: string;
    danger_bg: string;
    danger_text: string;
    sidebar_bg: string;
    sidebar_text: string;
    sidebar_active_bg: string;
    sidebar_active_text: string;
    sidebar_hover_bg: string;
    sidebar_hover_text: string;
    sidebar_border: string;
}

interface Props {
    settings: ThemeSettings;
}

const DEFAULTS: ThemeSettings = {
    primary_color: '#16a34a',
    primary_dark: '#15803d',
    primary_text: '#ffffff',
    accent_color: '#22c9a3',
    badge_bg: '#f97316',
    sale_bg: '#ef4444',
    navy_color: '#0f2033',
    header_bg: '#0f2033',
    header_text: '#ffffff',
    search_bg: '#383333',
    search_text: '#ffffff',
    announcement_bg: '#16a34a',
    announcement_text: '#ffffff',
    notice_from: '#fbbf24',
    notice_via: '#f97316',
    notice_to: '#f43f5e',
    notice_text: '#ffffff',
    footer_bg: '#0f2033',
    footer_text: '#ffffff',
    page_bg: '#ffffff',
    page_text: '#0a0f1c',
    card_bg: '#ffffff',
    card_text: '#0a0f1c',
    popover_bg: '#ffffff',
    popover_text: '#0a0f1c',
    secondary_bg: '#f1f5f9',
    secondary_text: '#0f2033',
    accent_bg: '#f1f5f9',
    accent_text: '#1e293b',
    muted_bg: '#f1f5f9',
    muted_text: '#64748b',
    border_color: '#e2e8f0',
    input_border: '#e2e8f0',
    focus_ring: '#94a3b8',
    danger_bg: '#ef4444',
    danger_text: '#ffffff',
    sidebar_bg: '#242628',
    sidebar_text: '#ffffff',
    sidebar_active_bg: '#1e293b',
    sidebar_active_text: '#f8fafc',
    sidebar_hover_bg: '#f1f5f9',
    sidebar_hover_text: '#1e293b',
    sidebar_border: '#e2e8f0',
};

const SECTIONS = [
    {
        title: 'Brand Colors',
        titleBn: 'ব্র্যান্ড কালার',
        description: 'Main brand colors for buttons, badges, and accents.',
        fields: [
            { key: 'primary_color', label: 'Primary', labelBn: 'প্রাইমারি (মূল রঙ)' },
            { key: 'primary_dark', label: 'Primary Dark', labelBn: 'প্রাইমারি ডার্ক (হোভার)' },
            { key: 'primary_text', label: 'Primary Text', labelBn: 'প্রাইমারি টেক্সট' },
            { key: 'accent_color', label: 'Accent / Teal', labelBn: 'অ্যাকসেন্ট / টিল' },
            { key: 'badge_bg', label: 'Orange (Flash / Badge)', labelBn: 'অরেঞ্জ (ফ্ল্যাশ সেল ব্যাজ)' },
            { key: 'sale_bg', label: 'Red (Sale)', labelBn: 'রেড (সেল / ডিসকাউন্ট)' },
            { key: 'navy_color', label: 'Navy', labelBn: 'নেভি (গাঢ় ব্র্যান্ড)' },
        ]
    },
    {
        title: 'Header',
        titleBn: 'হেডার',
        description: 'Top navigation bar colors.',
        fields: [
            { key: 'header_bg', label: 'Header Background', labelBn: 'হেডার ব্যাকগ্রাউন্ড' },
            { key: 'header_text', label: 'Header Text', labelBn: 'হেডার টেক্সট' },
        ]
    },
    {
        title: 'Search Bar',
        titleBn: 'সার্চ বার',
        description: 'Search input and icon colors in the header.',
        fields: [
            { key: 'search_bg', label: 'Search Bar Background', labelBn: 'সার্চ বার ব্যাকগ্রাউন্ড' },
            { key: 'search_text', label: 'Search Bar Text', labelBn: 'সার্চ বার টেক্সট' },
        ]
    },
    {
        title: 'Announcement Bar',
        titleBn: 'অ্যানাউন্সমেন্ট বার',
        description: 'Top-most announcement bar colors.',
        fields: [
            { key: 'announcement_bg', label: 'Announcement BG', labelBn: 'অ্যানাউন্সমেন্ট ব্যাকগ্রাউন্ড' },
            { key: 'announcement_text', label: 'Announcement Text', labelBn: 'অ্যানাউন্সমেন্ট টেক্সট' },
        ]
    },
    {
        title: 'Notice Marquee',
        titleBn: 'নোটিশ মার্কি',
        description: 'Moving notice marquee gradient and text.',
        fields: [
            { key: 'notice_from', label: 'Notice Gradient From', labelBn: 'নোটিশ গ্রেডিয়েন্ট শুরু' },
            { key: 'notice_via', label: 'Notice Gradient Via', labelBn: 'নোটিশ গ্রেডিয়েন্ট মাঝ' },
            { key: 'notice_to', label: 'Notice Gradient To', labelBn: 'নোটিশ গ্রেডিয়েন্ট শেষ' },
            { key: 'notice_text', label: 'Notice Text', labelBn: 'নোটিশ টেক্সট' },
        ]
    },
    {
        title: 'Footer',
        titleBn: 'ফুটার',
        description: 'Website footer background and text colors.',
        fields: [
            { key: 'footer_bg', label: 'Footer Background', labelBn: 'ফুটার ব্যাকগ্রাউন্ড' },
            { key: 'footer_text', label: 'Footer Text', labelBn: 'ফুটার টেক্সট' },
        ]
    },
    {
        title: 'Page & Surfaces',
        titleBn: 'পেজ ও সারফেস',
        description: 'Main backgrounds and surface elements.',
        fields: [
            { key: 'page_bg', label: 'Page Background', labelBn: 'পেজ ব্যাকগ্রাউন্ড' },
            { key: 'page_text', label: 'Page Text', labelBn: 'পেজ টেক্সট' },
            { key: 'card_bg', label: 'Card Background', labelBn: 'কার্ড ব্যাকগ্রাউন্ড' },
            { key: 'card_text', label: 'Card Text', labelBn: 'কার্ড টেক্সট' },
            { key: 'popover_bg', label: 'Popover BG', labelBn: 'পপওভার ব্যাকগ্রাউন্ড' },
            { key: 'popover_text', label: 'Popover Text', labelBn: 'পপওভার টেক্সট' },
        ]
    },
    {
        title: 'Secondary & Accent',
        titleBn: 'সেকেন্ডারি ও অ্যাকসেন্ট',
        description: 'Alternative backgrounds and highlights.',
        fields: [
            { key: 'secondary_bg', label: 'Secondary BG', labelBn: 'সেকেন্ডারি ব্যাকগ্রাউন্ড' },
            { key: 'secondary_text', label: 'Secondary Text', labelBn: 'সেকেন্ডারি টেক্সট' },
            { key: 'accent_bg', label: 'Accent BG', labelBn: 'অ্যাকসেন্ট ব্যাকগ্রাউন্ড' },
            { key: 'accent_text', label: 'Accent Text', labelBn: 'অ্যাকসেন্ট টেক্সট' },
        ]
    },
    {
        title: 'Muted / Subtext',
        titleBn: 'মিউটেড ও সাবটেক্সট',
        description: 'Subtle elements and secondary text.',
        fields: [
            { key: 'muted_bg', label: 'Muted BG', labelBn: 'মিউটেড ব্যাকগ্রাউন্ড' },
            { key: 'muted_text', label: 'Muted Text', labelBn: 'মিউটেড টেক্সট' },
        ]
    },
    {
        title: 'Forms & Borders',
        titleBn: 'ফর্ম ও বর্ডার',
        description: 'Input fields, rings, and general borders.',
        fields: [
            { key: 'border_color', label: 'Border', labelBn: 'বর্ডার' },
            { key: 'input_border', label: 'Input Border', labelBn: 'ইনপুট বর্ডার' },
            { key: 'focus_ring', label: 'Focus Ring', labelBn: 'ফোকাস রিং' },
        ]
    },
    {
        title: 'Danger / Destructive',
        titleBn: 'ডেঞ্জার ও ডেসট্রাকটিভ',
        description: 'Error states and destructive actions.',
        fields: [
            { key: 'danger_bg', label: 'Danger BG', labelBn: 'ডেঞ্জার ব্যাকগ্রাউন্ড' },
            { key: 'danger_text', label: 'Danger Text', labelBn: 'ডেঞ্জার টেক্সট' },
        ]
    },
    {
        title: 'Sidebar (Admin/Seller)',
        titleBn: 'সাইডবার',
        description: 'Admin and seller dashboard sidebar colors.',
        fields: [
            { key: 'sidebar_bg', label: 'Sidebar BG', labelBn: 'সাইডবার ব্যাকগ্রাউন্ড' },
            { key: 'sidebar_text', label: 'Sidebar Text', labelBn: 'সাইডবার টেক্সট' },
            { key: 'sidebar_active_bg', label: 'Sidebar Active', labelBn: 'সাইডবার অ্যাক্টিভ আইটেম' },
            { key: 'sidebar_active_text', label: 'Sidebar Active Text', labelBn: 'সাইডবার অ্যাক্টিভ টেক্সট' },
            { key: 'sidebar_hover_bg', label: 'Sidebar Hover', labelBn: 'সাইডবার হোভার' },
            { key: 'sidebar_hover_text', label: 'Sidebar Hover Text', labelBn: 'সাইডবার হোভার টেক্সট' },
            { key: 'sidebar_border', label: 'Sidebar Border', labelBn: 'সাইডবার বর্ডার' },
        ]
    }
];

const PRESETS = [
    { name: 'Green (Default)', colors: ['#16a34a', '#22c9a3', '#0f2033', '#ffffff'] },
    { name: 'Blue Ocean', colors: ['#2563eb', '#3b82f6', '#1e3a8a', '#ffffff'] },
    { name: 'Purple Royal', colors: ['#7c3aed', '#8b5cf6', '#2e1065', '#ffffff'] },
    { name: 'Red Bold', colors: ['#dc2626', '#ef4444', '#450a0a', '#ffffff'] },
    { name: 'Pink Sweet', colors: ['#db2777', '#ec4899', '#500724', '#ffffff'] },
    { name: 'Amber Warm', colors: ['#d97706', '#f59e0b', '#451a03', '#ffffff'] },
];

export default function ThemeColorPage({ settings }: Props) {
    const { data, setData, post, processing } = useForm<ThemeSettings>({
        ...DEFAULTS,
        ...settings,
    });

    const [searchQuery, setSearchQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/appearance/theme-colors', {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Theme colors saved successfully!',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                });
            },
            onError: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: 'Failed to save theme colors.',
                    showConfirmButton: false,
                    timer: 3000,
                });
            },
        });
    };

    const resetToDefaults = () => {
        Swal.fire({
            title: 'Reset to Defaults?',
            text: 'This will reset all theme colors to default values.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, reset all!',
        }).then((result) => {
            if (result.isConfirmed) {
                Object.entries(DEFAULTS).forEach(([key, value]) => {
                    setData(key as keyof ThemeSettings, value);
                });
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: 'Colors reset — click Save to apply.',
                    showConfirmButton: false,
                    timer: 2500,
                });
            }
        });
    };

    const applyPreset = (presetColors: string[]) => {
        setData(prev => ({
            ...prev,
            primary_color: presetColors[0],
            accent_color: presetColors[1],
            header_bg: presetColors[2],
            header_text: presetColors[3],
        }));
    };

    const handleColorChange = (key: keyof ThemeSettings, value: string) => {
        setData(key, value);
    };

    const handleHexInput = (key: keyof ThemeSettings, value: string) => {
        if (value && !value.startsWith('#')) {
            value = '#' + value;
        }
        setData(key, value);
    };

    const [activePickerKey, setActivePickerKey] = useState<keyof ThemeSettings | null>(null);

    const filteredSections = useMemo(() => {
        if (!searchQuery) return SECTIONS;
        const q = searchQuery.toLowerCase();
        return SECTIONS.filter(
            s => s.title.toLowerCase().includes(q) || s.titleBn.toLowerCase().includes(q)
        );
    }, [searchQuery]);

    const ColorField = ({ fieldKey, label, labelBn }: { fieldKey: keyof ThemeSettings, label: string, labelBn: string }) => (
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 border-b border-gray-100 last:border-0 gap-2 transition-colors">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setActivePickerKey(activePickerKey === fieldKey ? null : fieldKey)}
                    className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform" 
                    style={{ backgroundColor: data[fieldKey] }}
                    title="Click to open interactive color spectrum"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-800">{labelBn}</span>
                <span className="text-[11px] text-slate-400 font-mono">({label})</span>
            </div>
            
            <div className="flex items-center gap-2 relative">
                {/* Quick Swatches for Instant Mouse Selection */}
                <div className="hidden sm:flex items-center gap-1">
                    {['#16a34a', '#2563eb', '#7c3aed', '#dc2626', '#f97316', '#0f2033', '#ffffff'].map(hex => (
                        <button
                            key={hex}
                            type="button"
                            onClick={() => handleColorChange(fieldKey, hex)}
                            className="w-4.5 h-4.5 rounded-full border border-slate-300 shadow-2xs hover:scale-125 transition-transform cursor-pointer"
                            style={{ backgroundColor: hex }}
                            title={`Select ${hex}`}
                        />
                    ))}
                </div>

                {/* Color Input Box & Drag-Picker Trigger */}
                <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg p-1 shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setActivePickerKey(activePickerKey === fieldKey ? null : fieldKey)}
                        className="w-7 h-7 rounded-md border border-slate-200 cursor-pointer shadow-2xs transition-transform active:scale-95 flex items-center justify-center"
                        style={{ backgroundColor: data[fieldKey] || '#ffffff' }}
                        title="Click to drag-select color"
                    >
                        <Palette className="w-3.5 h-3.5 text-white mix-blend-difference" />
                    </button>
                    <input 
                        type="text" 
                        value={data[fieldKey] || ''}
                        onChange={(e) => handleHexInput(fieldKey, e.target.value)}
                        className="w-20 text-xs font-mono font-bold text-slate-700 border-0 focus:ring-0 p-0 uppercase" 
                        maxLength={7}
                    />
                </div>

                {/* Floating Interactive Drag Spectrum Picker */}
                {activePickerKey === fieldKey && (
                    <div className="absolute right-0 top-full mt-2 z-[99999]">
                        <InteractiveColorPicker
                            color={data[fieldKey] || '#ffffff'}
                            onChange={(hex) => handleColorChange(fieldKey, hex)}
                            onClose={() => setActivePickerKey(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <Head title="Theme Colors" />
            <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50 p-4 sm:p-6 pb-20">
                {/* Clean In-Flow Header Banner (Fixed Layout Overlap) */}
                <div className="max-w-[1400px] mx-auto bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white rounded-2xl shadow-md p-5 sm:p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight">Theme Colors — সম্পূর্ণ সাইট</h1>
                        <p className="text-xs sm:text-sm text-violet-100 mt-1 font-medium">
                            সম্পূর্ণ ওয়েবসাইটের প্রতিটি সেকশনের রঙ আলাদা করে পরিবর্তন করুন। পরিবর্তন সাথে সাথেই দেখা যাবে, সেভ করলে সাইটজুড়ে প্রয়োগ হবে।
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={resetToDefaults}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4" />
                            রিসেট করুন
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 text-xs sm:text-sm font-black transition-all shadow-md active:scale-95 disabled:opacity-70 cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'সেভ ও সাইটজুড়ে প্রয়োগ'}
                        </button>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6">
                    
                    {/* Left Column (Search & Sections) */}
                    <div className="flex-1 space-y-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                                placeholder="সেকশন এর নাম খুঁজুন... (যেমন: হেডার, বাটন, সাইডবার)"
                            />
                        </div>

                        {/* Sections Map */}
                        <div className="space-y-6">
                            {filteredSections.map((section, idx) => (
                                <div key={idx} className="bg-white rounded border border-gray-200">
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <div className="flex items-baseline gap-2">
                                            <h2 className="text-base font-bold text-gray-800">{section.titleBn}</h2>
                                            <span className="text-sm text-gray-400">{section.title}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                                    </div>
                                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                        {section.fields.map((field) => (
                                            <ColorField
                                                key={field.key}
                                                fieldKey={field.key as keyof ThemeSettings}
                                                label={field.label}
                                                labelBn={field.labelBn}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {filteredSections.length === 0 && (
                                <div className="text-center py-10 text-gray-500 bg-white rounded border border-gray-200">
                                    কোনো সেকশন পাওয়া যায়নি
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="w-full lg:w-80 shrink-0 space-y-6">
                        {/* Card 1: প্রিসেট থিম (Preset Themes) */}
                        <div className="bg-white rounded border border-gray-200 p-5 sticky top-28">
                            <h3 className="text-base font-bold text-gray-800 mb-4">প্রিসেট থিম</h3>
                            <div className="space-y-2 mb-6">
                                {PRESETS.map((preset, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => applyPreset(preset.colors)}
                                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer group transition-colors"
                                    >
                                        <div className="flex -space-x-1">
                                            {preset.colors.map((c, i) => (
                                                <div 
                                                    key={i} 
                                                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 group-hover:text-violet-600 transition-colors">
                                            {preset.name}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Card 2: লাইভ প্রিভিউ (Live Preview) */}
                            <h3 className="text-base font-bold text-gray-800 mb-4">লাইভ প্রিভিউ</h3>
                            <div className="rounded border overflow-hidden shadow-sm" style={{ borderColor: data.border_color }}>
                                {/* Top block (Header) */}
                                <div 
                                    className="px-3 py-2 flex items-center justify-between"
                                    style={{ backgroundColor: data.header_bg, color: data.header_text }}
                                >
                                    <div className="font-bold text-xs">MyStore</div>
                                    <div className="flex gap-2">
                                        <div className="w-12 h-3 rounded bg-white/20"></div>
                                        <div className="w-8 h-3 rounded bg-white/20"></div>
                                    </div>
                                </div>
                                
                                {/* Hero block (Banner) */}
                                <div 
                                    className="px-4 py-8 text-center"
                                    style={{ backgroundColor: data.primary_color, color: '#ffffff' }}
                                >
                                    <div className="text-sm font-bold mb-3">Summer Collection 2024</div>
                                    <button 
                                        type="button"
                                        className="px-4 py-1.5 rounded text-xs font-semibold"
                                        style={{ backgroundColor: data.accent_bg, color: data.accent_text }}
                                    >
                                        Shop Now
                                    </button>
                                </div>

                                {/* Body block */}
                                <div 
                                    className="p-4 space-y-4"
                                    style={{ backgroundColor: data.page_bg }}
                                >
                                    {/* Badges row */}
                                    <div className="flex gap-2 justify-center">
                                        <span className="px-2 py-0.5 rounded text-[10px] text-white" style={{ backgroundColor: data.badge_bg }}>NEW</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] text-white" style={{ backgroundColor: data.sale_bg }}>-50%</span>
                                        <span className="px-2 py-0.5 rounded text-[10px] text-white" style={{ backgroundColor: data.accent_color }}>TRENDING</span>
                                    </div>

                                    {/* Mock card */}
                                    <div 
                                        className="rounded border p-3"
                                        style={{ backgroundColor: data.card_bg, borderColor: data.border_color, color: data.card_text }}
                                    >
                                        <div className="w-full h-20 rounded bg-gray-100 mb-2"></div>
                                        <div className="w-20 h-2.5 rounded bg-gray-200 mb-1"></div>
                                        <div className="w-12 h-2.5 rounded bg-gray-200"></div>
                                    </div>
                                </div>

                                {/* Footer block */}
                                <div 
                                    className="px-4 py-3 text-center text-[10px]"
                                    style={{ backgroundColor: data.footer_bg, color: data.footer_text }}
                                >
                                    © 2024 MyStore. All rights reserved.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
