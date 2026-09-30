import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Clock, Check } from 'lucide-react';

export interface WarrantySelectorProps {
    value?: string | null;
    onChange: (formattedValue: string) => void;
    label?: string;
    className?: string;
}

function toBanglaNum(numStr: string | number): string {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(numStr).replace(/[0-9]/g, d => bnNums[Number(d)] || d);
}

export function parseWarrantyValue(val: string | null | undefined) {
    if (!val || val === 'No warranty' || val === 'কোনো ওয়ারেন্টি নেই' || val.trim() === '') {
        return {
            hasWarranty: false,
            duration: '1',
            unit: 'year',
            type: 'seller',
            note: ''
        };
    }

    let note = '';
    if (val.includes(' - ')) {
        const parts = val.split(' - ');
        note = parts.slice(1).join(' - ').trim();
    }

    let unit = 'year';
    let duration = '1';

    if (/lifetime|লাইফটাইম/i.test(val)) {
        unit = 'lifetime';
        duration = '1';
    } else {
        const dayMatch = val.match(/(\d+)\s*(days?|দিন)/i);
        const monthMatch = val.match(/(\d+)\s*(months?|মাস)/i);
        const yearMatch = val.match(/(\d+)\s*(years?|বছর)/i);

        if (dayMatch) {
            unit = 'day';
            duration = dayMatch[1];
        } else if (monthMatch) {
            unit = 'month';
            duration = monthMatch[1];
        } else if (yearMatch) {
            unit = 'year';
            duration = yearMatch[1];
        }
    }

    let type = 'seller';
    if (/replacement|রিপ্লেসমেন্ট/i.test(val)) type = 'replacement';
    else if (/service|সার্ভিস/i.test(val)) type = 'service';
    else if (/brand|official|ব্র্যান্ড|অফিসিয়াল/i.test(val)) type = 'brand';
    else type = 'seller';

    return { hasWarranty: true, duration, unit, type, note };
}

export default function WarrantySelector({
    value = 'No warranty',
    onChange,
    label = 'WARRANTY (ওয়ারেন্টি সুবিধা)',
    className = ''
}: WarrantySelectorProps) {
    const parsed = parseWarrantyValue(value);

    const [hasWarranty, setHasWarranty] = useState<boolean>(parsed.hasWarranty);
    const [duration, setDuration] = useState<string>(parsed.duration);
    const [unit, setUnit] = useState<string>(parsed.unit); // 'day' | 'month' | 'year' | 'lifetime'
    const [type, setType] = useState<string>(parsed.type); // 'seller' | 'brand' | 'replacement' | 'service'
    const [note, setNote] = useState<string>(parsed.note);

    // Re-sync if initial value changes externally
    useEffect(() => {
        const p = parseWarrantyValue(value);
        setHasWarranty(p.hasWarranty);
        setDuration(p.duration);
        setUnit(p.unit);
        setType(p.type);
        setNote(p.note);
    }, [value]);

    const notifyChange = (newHasWarranty: boolean, newDuration: string, newUnit: string, newType: string, newNote: string) => {
        if (!newHasWarranty) {
            onChange('No warranty');
            return;
        }

        const durNum = parseInt(newDuration, 10) || 1;
        const durBn = toBanglaNum(durNum);

        let unitEn = 'Year';
        let unitBn = 'বছর';

        if (newUnit === 'day') {
            unitEn = durNum === 1 ? '1 Day' : `${durNum} Days`;
            unitBn = `${durBn} দিন`;
        } else if (newUnit === 'month') {
            unitEn = durNum === 1 ? '1 Month' : `${durNum} Months`;
            unitBn = `${durBn} মাস`;
        } else if (newUnit === 'year') {
            unitEn = durNum === 1 ? '1 Year' : `${durNum} Years`;
            unitBn = `${durBn} বছর`;
        } else if (newUnit === 'lifetime') {
            unitEn = 'Lifetime';
            unitBn = 'লাইফটাইম';
        }

        let typeEn = "Seller's Warranty";
        let typeBn = 'সেলার ওয়ারেন্টি';

        if (newType === 'brand') {
            typeEn = 'Official Brand Warranty';
            typeBn = 'ব্র্যান্ড অফিসিয়াল ওয়ারেন্টি';
        } else if (newType === 'replacement') {
            typeEn = 'Replacement Warranty';
            typeBn = 'রিপ্লেসমেন্ট ওয়ারেন্টি';
        } else if (newType === 'service') {
            typeEn = 'Free Service Warranty';
            typeBn = 'ফ্রি সার্ভিস ওয়ারেন্টি';
        }

        let fullString = '';
        if (newUnit === 'lifetime') {
            fullString = `${typeEn} (লাইফটাইম ${typeBn})`;
        } else {
            fullString = `${unitEn} ${typeEn} (${unitBn} ${typeBn})`;
        }

        if (newNote.trim()) {
            fullString += ` - ${newNote.trim()}`;
        }

        onChange(fullString);
    };

    const handleToggleHasWarranty = (enable: boolean) => {
        setHasWarranty(enable);
        notifyChange(enable, duration, unit, type, note);
    };

    const handleDurationChange = (val: string) => {
        const cleaned = val.replace(/[^0-9]/g, '');
        setDuration(cleaned);
        notifyChange(hasWarranty, cleaned, unit, type, note);
    };

    const handleUnitChange = (newUnit: string) => {
        setUnit(newUnit);
        notifyChange(hasWarranty, duration, newUnit, type, note);
    };

    const handleTypeChange = (newType: string) => {
        setType(newType);
        notifyChange(hasWarranty, duration, unit, newType, note);
    };

    const handleNoteChange = (newNote: string) => {
        setNote(newNote);
        notifyChange(hasWarranty, duration, unit, type, newNote);
    };

    // Quick presets
    const presets = [
        { label: '৭ দিন', dur: '7', u: 'day' },
        { label: '১৫ দিন', dur: '15', u: 'day' },
        { label: '৩০ দিন', dur: '30', u: 'day' },
        { label: '৩ মাস', dur: '3', u: 'month' },
        { label: '৬ মাস', dur: '6', u: 'month' },
        { label: '১ বছর', dur: '1', u: 'year' },
        { label: '২ বছর', dur: '2', u: 'year' },
        { label: 'লাইফটাইম', dur: '1', u: 'lifetime' },
    ];

    const applyPreset = (dur: string, u: string) => {
        setDuration(dur);
        setUnit(u);
        setHasWarranty(true);
        notifyChange(true, dur, u, type, note);
    };

    const typesList = [
        { id: 'seller', labelBn: 'সেলার ওয়ারেন্টি', labelEn: "Seller's Warranty" },
        { id: 'brand', labelBn: 'ব্র্যান্ড ওয়ারেন্টি', labelEn: 'Brand / Official' },
        { id: 'replacement', labelBn: 'রিপ্লেসমেন্ট ওয়ারেন্টি', labelEn: 'Replacement' },
        { id: 'service', labelBn: 'সার্ভিস ওয়ারেন্টি', labelEn: 'Free Service' },
    ];

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {label}
                </label>
                {hasWarranty && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> সক্রিয়
                    </span>
                )}
            </div>

            {/* Radio Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* No Warranty Card */}
                <div
                    onClick={() => handleToggleHasWarranty(false)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-2.5 ${
                        !hasWarranty
                            ? 'bg-slate-50 dark:bg-slate-800/80 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                >
                    <input
                        type="radio"
                        checked={!hasWarranty}
                        onChange={() => handleToggleHasWarranty(false)}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            কোনো ওয়ারেন্টি নেই (No warranty)
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                            এই পণ্যে ওয়ারেন্টি প্রযোজ্য নয়
                        </p>
                    </div>
                </div>

                {/* Has Warranty Card */}
                <div
                    onClick={() => handleToggleHasWarranty(true)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start gap-2.5 ${
                        hasWarranty
                            ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-600 ring-2 ring-purple-600/20 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                >
                    <input
                        type="radio"
                        checked={hasWarranty}
                        onChange={() => handleToggleHasWarranty(true)}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>ওয়ারেন্টি প্রদান করুন (Add Warranty)</span>
                        </div>
                        <p className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold mt-0.5 leading-snug">
                            সময়কাল ও দিন নির্ধারণ করুন
                        </p>
                    </div>
                </div>
            </div>

            {/* Expanded Warranty Configuration Area */}
            {hasWarranty && (
                <div className="p-4 bg-purple-50/40 dark:bg-slate-950/70 border border-purple-200/80 dark:border-purple-900/50 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Duration Input & Unit Dropdown */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            ওয়ারেন্টির সময়কাল (Warranty Duration / Period) <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {unit !== 'lifetime' && (
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        value={duration}
                                        onChange={e => handleDurationChange(e.target.value)}
                                        placeholder="দিন/মাস/বছরের সংখ্যা (যেমন: 7, 30, 1)"
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                                </div>
                            )}

                            <select
                                value={unit}
                                onChange={e => handleUnitChange(e.target.value)}
                                className={`${unit === 'lifetime' ? 'col-span-2' : ''} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500`}
                            >
                                <option value="day">দিন (Days)</option>
                                <option value="month">মাস (Months)</option>
                                <option value="year">বছর (Years)</option>
                                <option value="lifetime">লাইফটাইম (Lifetime Warranty)</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div>
                        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            দ্রুত সিলেক্ট করুন (Quick Presets):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {presets.map(p => {
                                const isActive = unit === p.u && (p.u === 'lifetime' || duration === p.dur);
                                return (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => applyPreset(p.dur, p.u)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                            isActive
                                                ? 'bg-purple-600 text-white shadow-xs'
                                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 hover:text-purple-600'
                                        }`}
                                    >
                                        {isActive && <Check className="w-3 h-3" />}
                                        <span>{p.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Warranty Type Selector */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            ওয়ারেন্টির ধরন (Warranty Type)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {typesList.map(t => {
                                const isSelected = type === t.id;
                                return (
                                    <label
                                        key={t.id}
                                        onClick={() => handleTypeChange(t.id)}
                                        className={`p-2 rounded-xl border text-xs font-bold cursor-pointer transition flex items-center gap-2 ${
                                            isSelected
                                                ? 'bg-white dark:bg-slate-900 border-purple-600 text-purple-700 dark:text-purple-300 shadow-xs'
                                                : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="warranty_type_choice"
                                            checked={isSelected}
                                            onChange={() => handleTypeChange(t.id)}
                                            className="text-purple-600 focus:ring-purple-500"
                                        />
                                        <div className="truncate">
                                            <span className="block truncate">{t.labelBn}</span>
                                            <span className="block text-[9px] text-slate-400 font-normal truncate">{t.labelEn}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Optional Policy Note / Details */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            অতিরিক্ত শর্ত বা পলিসি নোট (ঐচ্ছিক / Optional)
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={e => handleNoteChange(e.target.value)}
                            placeholder="যেমন: যেকোনো ত্রুটিতে ৭ দিনের রিপ্লেসমেন্ট এবং ফ্রি সার্ভিস"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Live Preview Display */}
                    <div className="pt-1 border-t border-purple-200/50 dark:border-slate-800">
                        <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 mb-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>কাস্টমার যা দেখবে (Live Preview):</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold shrink-0">
                                🛡️
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                                    {unit === 'lifetime' ? 'লাইফটাইম' : `${toBanglaNum(duration || 1)} ${unit === 'day' ? 'দিন' : unit === 'month' ? 'মাস' : 'বছর'}`} {typesList.find(t => t.id === type)?.labelBn}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {note ? note : 'যেকোনো অফিসিয়াল সমস্যা হলে ওয়ারেন্টি সুবিধা মিলবে।'}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
