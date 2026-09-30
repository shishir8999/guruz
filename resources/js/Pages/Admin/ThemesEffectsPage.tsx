import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Edit2, X, Save, Calendar, Power, Check, Sliders, Eye, EyeOff, Layers, Zap } from 'lucide-react';
import { useParticleEffect, EffectType } from '@/Components/GlobalThemeEffects';

export interface Theme {
    id: string; 
    category: 'months' | 'seasons' | 'festivals';
    seasonLabel: string; 
    name: string; 
    nameBn: string;
    emoji: string; 
    effectType: EffectType; 
    effectEmoji: string;
    effectColor: string; 
    intensity: number; 
    opacity: number;
    speed: number;
    scheduled: boolean;
    active: boolean; 
    visibleOnSite: boolean; 
    gradient: string;
    startDate?: string; 
    endDate?: string;
}

const DEFAULT_THEMES: Theme[] = [
    // ─── 6 Seasons & Major Themes (Matching Screenshot Order) ──────────────────────
    { id: 'grishmo', category: 'seasons', seasonLabel: 'GRISHMO', name: 'Summer', nameBn: 'Grishmo (Summer)', emoji: '☀️', effectType: 'Grishmo', effectEmoji: '☀️', effectColor: 'text-amber-500', intensity: 45, opacity: 85, speed: 4, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-amber-400 to-orange-500', startDate: '04-14', endDate: '06-14' },
    { id: 'borsha', category: 'seasons', seasonLabel: 'BORSHA', name: 'Monsoon', nameBn: 'Borsha (Monsoon)', emoji: '🌧️', effectType: 'Borsha', effectEmoji: '🌧️', effectColor: 'text-blue-400', intensity: 100, opacity: 90, speed: 7, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-blue-500 to-cyan-500', startDate: '06-15', endDate: '08-15' },
    { id: 'sharat', category: 'seasons', seasonLabel: 'SHARAT', name: 'Autumn', nameBn: 'Sharat (Autumn)', emoji: '🌸', effectType: 'Sharat', effectEmoji: '🌸', effectColor: 'text-rose-400', intensity: 50, opacity: 85, speed: 4, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-rose-400 to-pink-500', startDate: '08-16', endDate: '10-15' },
    { id: 'hemanta', category: 'seasons', seasonLabel: 'HEMANTA', name: 'Late Autumn', nameBn: 'Hemanta (Late Autumn)', emoji: '🍁', effectType: 'Hemanta', effectEmoji: '🍁', effectColor: 'text-orange-400', intensity: 45, opacity: 80, speed: 4, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-orange-500 to-red-500', startDate: '10-16', endDate: '12-14' },
    { id: 'sheet', category: 'seasons', seasonLabel: 'SHEET', name: 'Winter', nameBn: 'Sheet (Winter)', emoji: '❄️', effectType: 'Sheet', effectEmoji: '❄️', effectColor: 'text-sky-400', intensity: 60, opacity: 85, speed: 5, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-sky-400 to-blue-500', startDate: '12-15', endDate: '02-13' },
    { id: 'bosonto', category: 'seasons', seasonLabel: 'BOSONTO', name: 'Spring', nameBn: 'Bosonto (Spring)', emoji: '🌸', effectType: 'Bosonto', effectEmoji: '🌸', effectColor: 'text-pink-400', intensity: 55, opacity: 85, speed: 5, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-pink-400 to-rose-400', startDate: '02-14', endDate: '04-13' },

    // ─── Religious & Festivals (Festivals) ─────────────────
    { id: 'rojar_eid', category: 'festivals', seasonLabel: 'ROJAR_EID', name: 'Eid-ul-Fitr', nameBn: 'Eid ul-Fitr', emoji: '🌙', effectType: 'RojarEid', effectEmoji: '🌙', effectColor: 'text-emerald-400', intensity: 80, opacity: 90, speed: 5, scheduled: false, active: false, visibleOnSite: true, gradient: 'from-emerald-500 to-teal-600', startDate: '03-31', endDate: '04-03' },
    { id: 'qurbani_eid', category: 'festivals', seasonLabel: 'QURBANI_EID', name: 'Eid-ul-Adha', nameBn: 'Eid ul-Adha (Qurbani)', emoji: '🕋', effectType: 'QurbaniEid', effectEmoji: '⭐', effectColor: 'text-emerald-500', intensity: 75, opacity: 90, speed: 5, scheduled: false, active: false, visibleOnSite: true, gradient: 'from-green-600 to-emerald-500', startDate: '06-05', endDate: '06-09' },
    { id: 'durga_puja', category: 'festivals', seasonLabel: 'DURGA_PUJA', name: 'Durga Puja', nameBn: 'Durga Puja', emoji: '🪔', effectType: 'DurgaPuja', effectEmoji: '🪔', effectColor: 'text-amber-500', intensity: 85, opacity: 95, speed: 6, scheduled: false, active: false, visibleOnSite: true, gradient: 'from-amber-500 via-orange-500 to-red-500', startDate: '10-08', endDate: '10-13' },
    { id: 'eid_miladunnabi', category: 'festivals', seasonLabel: 'EID_MILADUNNABI', name: 'Eid-e-Miladunnabi', nameBn: 'Eid-e-Miladunnabi', emoji: '🟢', effectType: 'EidMiladunnabi', effectEmoji: '🕌', effectColor: 'text-teal-400', intensity: 85, opacity: 90, speed: 5, scheduled: false, active: false, visibleOnSite: true, gradient: 'from-teal-600 to-emerald-600', startDate: '09-15', endDate: '09-17' },
    { id: 'deepavali', category: 'festivals', seasonLabel: 'DEEPAVALI', name: 'Diwali / Kali Puja', nameBn: 'Deepavali', emoji: '🪔', effectType: 'Deepavali', effectEmoji: '🪔', effectColor: 'text-yellow-400', intensity: 95, opacity: 95, speed: 7, scheduled: false, active: false, visibleOnSite: true, gradient: 'from-yellow-500 to-amber-600', startDate: '11-01', endDate: '11-03' },
    { id: 'christmas', category: 'festivals', seasonLabel: 'CHRISTMAS', name: 'Christmas', nameBn: 'Christmas', emoji: '🎄', effectType: 'Christmas', effectEmoji: '🎅', effectColor: 'text-red-400', intensity: 80, opacity: 90, speed: 5, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-red-600 to-green-700', startDate: '12-24', endDate: '12-26' },
    { id: 'new_year', category: 'festivals', seasonLabel: 'NEW_YEAR', name: 'Happy New Year 2026', nameBn: 'New Year', emoji: '🎆', effectType: 'NewYear', effectEmoji: '🎉', effectColor: 'text-indigo-400', intensity: 100, opacity: 95, speed: 8, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-indigo-600 via-purple-600 to-pink-600', startDate: '12-31', endDate: '01-02' },
    { id: 'victory_day', category: 'festivals', seasonLabel: 'VICTORY_DAY', name: 'Victory Day', nameBn: 'Victory Day', emoji: '🔴🟢', effectType: 'VictoryDay', effectEmoji: '🔴', effectColor: 'text-emerald-500', intensity: 85, opacity: 90, speed: 6, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-emerald-600 via-green-600 to-red-600', startDate: '12-16', endDate: '12-16' },
    { id: 'valentines', category: 'festivals', seasonLabel: 'VALENTINES', name: "Valentine's Day", nameBn: "Valentine's Day", emoji: '💖', effectType: 'Valentines', effectEmoji: '🌹', effectColor: 'text-rose-500', intensity: 80, opacity: 90, speed: 5, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-pink-500 to-rose-600', startDate: '02-14', endDate: '02-14' },

    // ─── 12 Bengali Months (Months) ──────────────────────
    { id: 'boishakh', category: 'months', seasonLabel: 'BOISHAKH', name: 'Boishakh', nameBn: 'Boishakh', emoji: '🎊', effectType: 'Boishakh', effectEmoji: '🪘', effectColor: 'text-red-500', intensity: 85, opacity: 90, speed: 6, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-red-500 via-orange-500 to-amber-500', startDate: '04-14', endDate: '05-14' },
    { id: 'joishtho', category: 'months', seasonLabel: 'JOISHTHO', name: 'Joishtho', nameBn: 'Joishtho', emoji: '🥭', effectType: 'Joishtho', effectEmoji: '🥭', effectColor: 'text-amber-500', intensity: 65, opacity: 85, speed: 5, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-amber-400 to-orange-500', startDate: '05-15', endDate: '06-14' },
    { id: 'ashar', category: 'months', seasonLabel: 'ASHAR', name: 'Ashar', nameBn: 'Ashar', emoji: '🌧️', effectType: 'Ashar', effectEmoji: '🌧️', effectColor: 'text-blue-500', intensity: 95, opacity: 90, speed: 7, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-blue-600 to-cyan-500', startDate: '06-15', endDate: '07-15' },
    { id: 'shrabon', category: 'months', seasonLabel: 'SHRABON', name: 'Shrabon', nameBn: 'Shrabon', emoji: '☔', effectType: 'Shrabon', effectEmoji: '☔', effectColor: 'text-sky-500', intensity: 90, opacity: 85, speed: 7, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-cyan-600 to-blue-500', startDate: '07-16', endDate: '08-15' },
    { id: 'bhadro', category: 'months', seasonLabel: 'BHADRO', name: 'Bhadro', nameBn: 'Bhadro', emoji: '🌾', effectType: 'Bhadro', effectEmoji: '🌾', effectColor: 'text-slate-300', intensity: 55, opacity: 80, speed: 4, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-sky-300 to-indigo-400', startDate: '08-16', endDate: '09-15' },
    { id: 'ashwin', category: 'months', seasonLabel: 'ASHWIN', name: 'Ashwin', nameBn: 'Ashwin', emoji: '🪔', effectType: 'Ashwin', effectEmoji: '🪔', effectColor: 'text-rose-500', intensity: 80, opacity: 90, speed: 5, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-purple-500 to-rose-500', startDate: '09-16', endDate: '10-15' },
    { id: 'kartik', category: 'months', seasonLabel: 'KARTIK', name: 'Kartik', nameBn: 'Kartik', emoji: '🪔', effectType: 'Kartik', effectEmoji: '🏮', effectColor: 'text-amber-400', intensity: 85, opacity: 90, speed: 6, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-amber-500 to-yellow-500', startDate: '10-16', endDate: '11-15' },
    { id: 'agrahayan', category: 'months', seasonLabel: 'AGRAHAYAN', name: 'Agrahayan', nameBn: 'Agrahayan', emoji: '🌾', effectType: 'Agrahayan', effectEmoji: '🌾', effectColor: 'text-yellow-600', intensity: 60, opacity: 80, speed: 4, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-yellow-600 to-amber-700', startDate: '11-16', endDate: '12-15' },
    { id: 'poush', category: 'months', seasonLabel: 'POUSH', name: 'Poush', nameBn: 'Poush', emoji: '❄️', effectType: 'Poush', effectEmoji: '❄️', effectColor: 'text-sky-300', intensity: 70, opacity: 85, speed: 4, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-sky-500 to-indigo-600', startDate: '12-16', endDate: '01-14' },
    { id: 'magh', category: 'months', seasonLabel: 'MAGH', name: 'Magh', nameBn: 'Magh', emoji: '🪕', effectType: 'Magh', effectEmoji: '🪕', effectColor: 'text-yellow-400', intensity: 65, opacity: 85, speed: 4, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-yellow-400 to-amber-500', startDate: '01-15', endDate: '02-13' },
    { id: 'falgun', category: 'months', seasonLabel: 'FALGUN', name: 'Falgun', nameBn: 'Falgun', emoji: '🌺', effectType: 'Falgun', effectEmoji: '🌺', effectColor: 'text-rose-500', intensity: 85, opacity: 90, speed: 5, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-rose-500 to-pink-500', startDate: '02-14', endDate: '03-14' },
    { id: 'chaitra', category: 'months', seasonLabel: 'CHAITRA', name: 'Chaitra', nameBn: 'Chaitra', emoji: '🪁', effectType: 'Chaitra', effectEmoji: '🪁', effectColor: 'text-orange-500', intensity: 75, opacity: 85, speed: 6, scheduled: true, active: false, visibleOnSite: true, gradient: 'from-orange-500 to-red-500', startDate: '03-15', endDate: '04-13' },
];

export default function ThemesEffectsPage({ initialActiveThemeId, initialThemesData }: any) {
    const [themes, setThemes] = useState<Theme[]>(() => {
        if (!initialThemesData) return DEFAULT_THEMES;
        const loaded = typeof initialThemesData === 'string' ? JSON.parse(initialThemesData) : initialThemesData;
        return DEFAULT_THEMES.map(dt => {
            const found = loaded.find((t: any) => t.id === dt.id);
            return found ? { ...dt, ...found } : dt;
        });
    });

    const [editTheme, setEditTheme] = useState<Theme | null>(null);
    const [editIntensity, setEditIntensity] = useState(50);
    const [editOpacity, setEditOpacity] = useState(90);
    const [editSpeed, setEditSpeed] = useState(5);
    const [editScheduled, setEditScheduled] = useState(false);
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const activeTheme = themes.find(t => t.active) ?? null;

    useParticleEffect(
        canvasRef,
        activeTheme ? activeTheme.effectType : null,
        activeTheme ? activeTheme.intensity : 50,
        activeTheme?.opacity !== undefined ? activeTheme.opacity : 90,
        activeTheme?.speed || 5,
        !!activeTheme
    );

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const syncToBackend = (newThemes: Theme[], newActiveId: string | null) => {
        setSaving(true);
        router.post('/admin/appearance/themes-effects', {
            active_theme_id: newActiveId,
            themes_data: newThemes
        }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setSaving(false),
        });
    };

    const activateTheme = (id: string) => {
        const newThemes = themes.map(t => ({ ...t, active: t.id === id }));
        setThemes(newThemes);
        const theme = newThemes.find(t => t.id === id);
        showToast(`${theme?.nameBn || theme?.name} theme is now active!`);
        syncToBackend(newThemes, id);
    };

    const turnAllOff = () => {
        const newThemes = themes.map(t => ({ ...t, active: false }));
        setThemes(newThemes);
        showToast('Turned off all active theme effects.');
        syncToBackend(newThemes, null);
    };

    const toggleVisibility = (id: string) => {
        const newThemes = themes.map(t => t.id === id ? { ...t, visibleOnSite: !t.visibleOnSite } : t);
        setThemes(newThemes);
        syncToBackend(newThemes, newThemes.find(t => t.active)?.id || null);
    };

    const openEdit = (t: Theme) => {
        setEditTheme(t);
        setEditIntensity(t.intensity);
        setEditOpacity(t.opacity !== undefined ? t.opacity : 90);
        setEditSpeed(t.speed || 5);
        setEditScheduled(t.scheduled);
        setEditStartDate(t.startDate || '');
        setEditEndDate(t.endDate || '');
    };

    const saveEdit = () => {
        if (!editTheme) return;
        const newThemes = themes.map(t => 
            t.id === editTheme.id ? { 
                ...t, 
                intensity: editIntensity,
                opacity: editOpacity,
                speed: editSpeed,
                scheduled: editScheduled,
                startDate: editStartDate,
                endDate: editEndDate,
            } : t
        );
        setThemes(newThemes);
        setEditTheme(null);
        showToast(`✅ Saved ${editTheme.nameBn} settings!`);
        syncToBackend(newThemes, newThemes.find(t => t.active)?.id || null);
    };

    return (
        <>
            <Head title="Themes & effects — Admin" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{toast}</span>
                    </div>
                )}

                {/* 🟣 VIBRANT PURPLE HEADER BANNER MATCHING SCREENSHOT */}
                <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 md:p-8 rounded-2xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                            Themes & effects
                        </h1>
                        <p className="text-xs sm:text-sm text-purple-100/90 mt-1 font-medium max-w-2xl">
                            Activate a seasonal theme, customise its banner & tint, or schedule it. Only one theme is active at a time.
                        </p>
                    </div>

                    <div className="shrink-0">
                        <button
                            onClick={turnAllOff}
                            className="bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition active:scale-95 border border-slate-200 cursor-pointer"
                        >
                            <Power className="w-4 h-4 text-slate-700" />
                            Turn all off
                        </button>
                    </div>
                </div>

                {/* 🎴 THEMES CARDS GRID MATCHING SCREENSHOT */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {themes.map((t) => {
                        const isCurrentActive = t.active;

                        return (
                            <div
                                key={t.id}
                                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between relative ${
                                    isCurrentActive
                                        ? 'border-orange-500 ring-2 ring-orange-500/30 shadow-md bg-orange-50/10'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                                }`}
                            >
                                {/* Active Badge on Top Right */}
                                {isCurrentActive && (
                                    <div className="absolute top-4 right-4 z-10 bg-orange-500 text-white font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                        <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                                    </div>
                                )}

                                <div>
                                    {/* Top Label (Category / Season in Muted Caps) */}
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                        {t.seasonLabel || t.id.toUpperCase()}
                                    </span>

                                    {/* Theme Title */}
                                    <div className="flex items-center gap-2.5 mb-0.5">
                                        <span className="text-2xl">{t.emoji}</span>
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                                            {t.nameBn || t.name}
                                        </h3>
                                    </div>

                                    {/* Subtitle */}
                                    <span className="block text-xs font-semibold text-slate-400 mb-4">
                                        {t.name}
                                    </span>

                                    {/* Effect Metrics Line */}
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 my-4 flex-wrap">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                                        <span>{t.effectType}</span>
                                        <span className="text-slate-300">•</span>
                                        <span>intensity {t.intensity}%</span>
                                        {t.scheduled && (
                                            <>
                                                <span className="text-slate-300">•</span>
                                                <span className="flex items-center gap-1 text-slate-400 font-medium">
                                                    <Calendar className="w-3 h-3" /> scheduled
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    {/* Action Buttons Row */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        {isCurrentActive ? (
                                            <div className="bg-orange-100/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-extrabold text-sm py-2.5 rounded-xl flex-1 text-center border border-orange-200/50">
                                                Active
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => activateTheme(t.id)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm py-2.5 rounded-xl flex-1 text-center shadow-xs transition active:scale-95 cursor-pointer"
                                            >
                                                Activate
                                            </button>
                                        )}

                                        <button
                                            onClick={() => toggleVisibility(t.id)}
                                            title="Toggle visibility"
                                            className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 p-2.5 rounded-xl text-slate-500 dark:text-slate-400 transition cursor-pointer"
                                        >
                                            {t.visibleOnSite ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                                        </button>

                                        <button
                                            onClick={() => openEdit(t)}
                                            className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center gap-1 transition cursor-pointer"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                    </div>

                                    {/* Effects Visible Checkbox Row */}
                                    <label className="flex items-center gap-2 cursor-pointer mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400 select-none">
                                        <input
                                            type="checkbox"
                                            checked={t.visibleOnSite}
                                            onChange={() => toggleVisibility(t.id)}
                                            className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                                        />
                                        <span>Effects visible on site</span>
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* EDIT THEME MODAL */}
            {editTheme && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{editTheme.emoji}</span>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white">
                                    Edit {editTheme.nameBn}
                                </h3>
                            </div>
                            <button onClick={() => setEditTheme(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Intensity Slider */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <span>Effect Intensity (ঘনত্ব)</span>
                                    <span className="text-orange-500 font-black">{editIntensity}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={editIntensity}
                                    onChange={e => setEditIntensity(Number(e.target.value))}
                                    className="w-full accent-orange-500"
                                />
                            </div>

                            {/* Opacity Slider */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <span>Effect Opacity (স্বচ্ছতা)</span>
                                    <span className="text-purple-500 font-black">{editOpacity}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={editOpacity}
                                    onChange={e => setEditOpacity(Number(e.target.value))}
                                    className="w-full accent-purple-500"
                                />
                            </div>

                            {/* Speed Slider */}
                            <div>
                                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    <span>Animation Speed (গতি)</span>
                                    <span className="text-emerald-500 font-black">{editSpeed}x</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={editSpeed}
                                    onChange={e => setEditSpeed(Number(e.target.value))}
                                    className="w-full accent-emerald-500"
                                />
                            </div>

                            {/* Scheduled Checkbox */}
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
                                <input
                                    type="checkbox"
                                    checked={editScheduled}
                                    onChange={e => setEditScheduled(e.target.checked)}
                                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500"
                                />
                                <span>Auto-Schedule Theme Dates</span>
                            </label>

                            {/* Dates if Scheduled */}
                            {editScheduled && (
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Start Date (MM-DD)</label>
                                        <input
                                            type="text"
                                            placeholder="04-14"
                                            value={editStartDate}
                                            onChange={e => setEditStartDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1">End Date (MM-DD)</label>
                                        <input
                                            type="text"
                                            placeholder="06-14"
                                            value={editEndDate}
                                            onChange={e => setEditEndDate(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setEditTheme(null)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-extrabold text-xs hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
