import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { FileText, Save, Image as ImageIcon, PaintBucket, Droplets, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

const COLOR_PRESETS = [
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Emerald', value: '#059669' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Slate', value: '#334155' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Fuchsia', value: '#c026d3' },
];

export default function InvoiceSettingsPage({ settings }: { settings: any }) {
    const { data, setData, post, processing } = useForm({
        logo: null as File | null,
        color: settings.color || '#7c3aed',
        company_info: settings.company_info || '',
        terms: settings.terms || '',
        watermark: settings.watermark || '',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.logo ? `/${settings.logo}` : null
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('logo', e.target.files[0]);
            setLogoPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/finance/invoices/settings', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Saved!',
                    text: 'Invoice Settings updated successfully.',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }
        });
    };

    return (
        <>
            <Head title="Invoice Settings — Admin Panel" />

            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Banner Header */}
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-md">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 opacity-80" />
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">Invoice Customization</h1>
                            <p className="text-xs font-semibold text-purple-100 opacity-90 mt-1">
                                Customize the look and feel of the generated PDF invoices
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">

                        {/* Logo Upload */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                                <ImageIcon className="w-4 h-4 text-purple-600" />
                                Invoice Logo
                            </label>
                            
                            <div className="flex items-start gap-6">
                                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                                    />
                                    <p className="text-xs text-slate-400 font-medium mt-3">
                                        Upload a high-resolution logo (PNG/JPG). If empty, website logo will be used automatically.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Brand Color */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                                <PaintBucket className="w-4 h-4 text-purple-600" />
                                Brand Primary Color
                            </label>
                            
                            {/* Color Presets Grid */}
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
                                {COLOR_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => setData('color', preset.value)}
                                        className={`w-full aspect-square rounded-xl border-2 transition-all duration-200 hover:scale-110 ${
                                            data.color === preset.value 
                                                ? 'border-slate-800 dark:border-white ring-2 ring-offset-2 ring-slate-400 scale-110' 
                                                : 'border-transparent'
                                        }`}
                                        style={{ backgroundColor: preset.value }}
                                        title={preset.name}
                                    />
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <input 
                                    type="color" 
                                    value={data.color}
                                    onChange={e => setData('color', e.target.value)}
                                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200 p-0.5"
                                />
                                <input 
                                    type="text"
                                    value={data.color}
                                    onChange={e => setData('color', e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 font-mono w-32"
                                    placeholder="#000000"
                                />
                                {/* Live Preview Box */}
                                <div 
                                    className="flex-1 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-inner"
                                    style={{ backgroundColor: data.color }}
                                >
                                    <Eye className="w-4 h-4 mr-2" /> Live Preview
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-2">
                                This color will be used for headers, borders, and accents in the invoice.
                            </p>
                        </div>

                        {/* Watermark Text */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                                <Droplets className="w-4 h-4 text-purple-600" />
                                Watermark Text
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={data.watermark}
                                    onChange={e => setData('watermark', e.target.value)}
                                    maxLength={50}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="e.g. PAID, CONFIDENTIAL, DRAFT (leave empty to use order status)"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                                    {data.watermark.length}/50
                                </span>
                            </div>
                            
                            {/* Watermark Preview */}
                            {data.watermark && (
                                <div className="mt-3 relative overflow-hidden rounded-xl bg-white border border-slate-200 h-24 flex items-center justify-center">
                                    <span 
                                        className="text-4xl font-black uppercase opacity-[0.06] rotate-[-30deg] select-none"
                                        style={{ color: data.color }}
                                    >
                                        {data.watermark}
                                    </span>
                                    <span className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-medium">
                                        Watermark Preview
                                    </span>
                                </div>
                            )}
                            
                            <p className="text-xs text-slate-400 font-medium mt-2">
                                This text appears as a large diagonal watermark across the invoice. Leave empty to automatically show order status (e.g. DELIVERED, PROCESSING).
                            </p>
                        </div>

                        {/* Company Info */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                                Company Information
                            </label>
                            <textarea
                                value={data.company_info}
                                onChange={e => setData('company_info', e.target.value)}
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder={"Your Company Name\nAddress Line 1\nEmail: contact@example.com"}
                            />
                            <p className="text-xs text-slate-400 font-medium mt-2">
                                Appears at the top right/left of the invoice below the logo.
                            </p>
                        </div>

                        {/* Terms & Conditions */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                                Invoice Footer & Terms
                            </label>
                            <textarea
                                value={data.terms}
                                onChange={e => setData('terms', e.target.value)}
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Thank you for your business. Returns are accepted within..."
                            />
                            <p className="text-xs text-slate-400 font-medium mt-2">
                                Appears at the bottom of every invoice page.
                            </p>
                        </div>

                    </div>

                    <div className="p-6 md:px-8 md:py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>

            </div>
        </>
    );
}
