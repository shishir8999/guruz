import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Pipette, Check, X } from 'lucide-react';

interface InteractiveColorPickerProps {
    color: string;
    onChange: (hex: string) => void;
    onClose?: () => void;
}

// Color conversion helpers (HEX <-> HSV <-> RGB)
function hexToHsv(hex: string): { h: number; s: number; v: number } {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return { h: 0, s: 1, v: 1 };

    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s, v };
}

function hsvToHex(h: number, s: number, v: number): string {
    h = (h % 360) / 360;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r = 0, g = 0, b = 0;
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    const toHex = (n: number) => {
        const hx = Math.round(n * 255).toString(16);
        return hx.length === 1 ? '0' + hx : hx;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function InteractiveColorPicker({ color, onChange, onClose }: InteractiveColorPickerProps) {
    const [hsv, setHsv] = useState(() => hexToHsv(color || '#16a34a'));
    const [hexInput, setHexInput] = useState(color || '#16a34a');
    const spectrumRef = useRef<HTMLDivElement>(null);
    const hueRef = useRef<HTMLDivElement>(null);
    const isDraggingSpectrum = useRef(false);
    const isDraggingHue = useRef(false);

    useEffect(() => {
        const newHsv = hexToHsv(color || '#16a34a');
        setHsv(newHsv);
        setHexInput(color || '#16a34a');
    }, [color]);

    const updateColorFromHsv = useCallback((newH: number, newS: number, newV: number) => {
        const newHex = hsvToHex(newH, newS, newV);
        setHsv({ h: newH, s: newS, v: newV });
        setHexInput(newHex);
        onChange(newHex);
    }, [onChange]);

    // Handle 2D Saturation / Value Spectrum Drag
    const handleSpectrumMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!spectrumRef.current) return;
        const rect = spectrumRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

        const s = x / rect.width;
        const v = 1 - (y / rect.height);

        updateColorFromHsv(hsv.h, s, v);
    }, [hsv.h, updateColorFromHsv]);

    // Handle 1D Hue Bar Drag
    const handleHueMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!hueRef.current) return;
        const rect = hueRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const h = (x / rect.width) * 360;

        updateColorFromHsv(h, hsv.s, hsv.v);
    }, [hsv.s, hsv.v, updateColorFromHsv]);

    // Mouse / Touch Event Listeners for Global Continuous Dragging
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDraggingSpectrum.current) handleSpectrumMove(e);
            if (isDraggingHue.current) handleHueMove(e);
        };

        const handleMouseUp = () => {
            isDraggingSpectrum.current = false;
            isDraggingHue.current = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isDraggingSpectrum.current) handleSpectrumMove(e);
            if (isDraggingHue.current) handleHueMove(e);
        };

        const handleTouchEnd = () => {
            isDraggingSpectrum.current = false;
            isDraggingHue.current = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleSpectrumMove, handleHueMove]);

    const handleEyeDropper = async () => {
        if ((window as any).EyeDropper) {
            try {
                const eyeDropper = new (window as any).EyeDropper();
                const result = await eyeDropper.open();
                if (result?.sRGBHex) {
                    onChange(result.sRGBHex);
                    setHexInput(result.sRGBHex);
                    setHsv(hexToHsv(result.sRGBHex));
                }
            } catch {
                // User canceled eyedropper
            }
        }
    };

    const pureHueHex = hsvToHex(hsv.h, 1, 1);
    const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

    return (
        <div 
            className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 space-y-3 select-none z-[999999]"
            onClick={e => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: currentHex }} />
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase font-mono">{currentHex}</span>
                </div>
                {onClose && (
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* 2D Saturation & Brightness Palette (Mouse Drag) */}
            <div
                ref={spectrumRef}
                onMouseDown={(e) => {
                    isDraggingSpectrum.current = true;
                    handleSpectrumMove(e.nativeEvent);
                }}
                onTouchStart={(e) => {
                    isDraggingSpectrum.current = true;
                    handleSpectrumMove(e.nativeEvent);
                }}
                className="w-full h-36 rounded-xl relative cursor-crosshair overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700"
                style={{
                    backgroundColor: pureHueHex,
                    backgroundImage: 'linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)'
                }}
            >
                {/* Pointer Target Ring */}
                <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.8)] absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform active:scale-125"
                    style={{
                        left: `${hsv.s * 100}%`,
                        top: `${(1 - hsv.v) * 100}%`,
                        backgroundColor: currentHex,
                    }}
                />
            </div>

            {/* 1D Rainbow Hue Slider (Mouse Drag) */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <span>Hue / কালার বর্ণালী</span>
                    <span>{Math.round(hsv.h)}°</span>
                </div>
                <div
                    ref={hueRef}
                    onMouseDown={(e) => {
                        isDraggingHue.current = true;
                        handleHueMove(e.nativeEvent);
                    }}
                    onTouchStart={(e) => {
                        isDraggingHue.current = true;
                        handleHueMove(e.nativeEvent);
                    }}
                    className="w-full h-4 rounded-full relative cursor-pointer shadow-inner border border-slate-200 dark:border-slate-700"
                    style={{
                        background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
                    }}
                >
                    <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-[0_0_4px_rgba(0,0,0,0.8)] absolute top-0 -translate-x-1/2 pointer-events-none"
                        style={{
                            left: `${(hsv.h / 360) * 100}%`,
                            backgroundColor: pureHueHex,
                        }}
                    />
                </div>
            </div>

            {/* Controls: Hex input + Eyedropper */}
            <div className="flex items-center gap-2 pt-1">
                {(window as any).EyeDropper && (
                    <button
                        type="button"
                        onClick={handleEyeDropper}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 shadow-2xs cursor-pointer"
                        title="Pick Color from Screen"
                    >
                        <Pipette className="w-4 h-4 text-purple-600" />
                    </button>
                )}

                <div className="flex-1 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-black text-slate-400">#</span>
                    <input
                        type="text"
                        value={hexInput.replace('#', '')}
                        onChange={(e) => {
                            const val = '#' + e.target.value;
                            setHexInput(val);
                            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                                onChange(val);
                                setHsv(hexToHsv(val));
                            }
                        }}
                        className="w-full bg-transparent text-xs font-black font-mono text-slate-800 dark:text-slate-100 uppercase border-0 p-0 focus:ring-0"
                        maxLength={6}
                    />
                </div>
            </div>

            {/* Quick Palette Swatches */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Quick Presets</span>
                <div className="grid grid-cols-7 gap-1.5 pt-0.5">
                    {[
                        '#16a34a', '#22c9a3', '#0052cc', '#2563eb', '#7c3aed', '#db2777', '#dc2626',
                        '#ea580c', '#f59e0b', '#0f2033', '#1e293b', '#64748b', '#ffffff', '#000000'
                    ].map(hex => (
                        <button
                            key={hex}
                            type="button"
                            onClick={() => {
                                onChange(hex);
                                setHexInput(hex);
                                setHsv(hexToHsv(hex));
                            }}
                            className="w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-700 shadow-2xs hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                            style={{ backgroundColor: hex }}
                            title={hex}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
