import React from 'react';
import { Landmark, Banknote, QrCode } from 'lucide-react';

interface GatewayLogoProps {
    code: string;
    customUrl?: string | null;
    className?: string;
    size?: number;
}

export function GatewayLogo({ code, customUrl, className = '', size = 36 }: GatewayLogoProps) {
    const [hasError, setHasError] = React.useState(false);

    React.useEffect(() => {
        setHasError(false);
    }, [customUrl]);

    if (customUrl && !hasError) {
        return (
            <div 
                className={`rounded-xl flex items-center justify-center p-0.5 bg-white border border-slate-100 overflow-hidden shrink-0 shadow-2xs ${className}`}
                style={{ width: size, height: size }}
            >
                <img 
                    key={customUrl}
                    src={customUrl} 
                    alt={code} 
                    className="w-full h-full object-contain rounded-lg" 
                    onError={() => setHasError(true)}
                />
            </div>
        );
    }

    switch (code) {
        case 'bkash':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-[#E2136E] text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="50,15 90,80 50,65 10,80" />
                        <circle cx="50" cy="45" r="8" fill="#ffffff" />
                        <path d="M30,80 L50,40 L70,80 Z" fill="#ffffff" opacity="0.9" />
                    </svg>
                </div>
            );

        case 'nagad':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-[#ED1C24] to-[#F7941D] text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 15 C30 15 15 30 15 50 C15 70 30 85 50 85 C65 85 75 75 75 60 C75 45 60 40 50 40 C40 40 35 45 35 50 C35 55 40 60 45 60 C50 60 55 55 55 50" stroke="#ffffff" strokeWidth="10" fill="none" strokeLinecap="round" />
                    </svg>
                </div>
            );

        case 'rocket':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-[#8C3494] text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 10 C60 30 75 50 75 70 C75 85 65 90 50 85 C35 90 25 85 25 70 C25 50 40 30 50 10 Z" fill="#ffffff" />
                        <circle cx="50" cy="50" r="10" fill="#8C3494" />
                        <polygon points="50,85 40,95 60,95" fill="#F39C12" />
                    </svg>
                </div>
            );

        case 'bangla_qr':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-rose-500 to-emerald-600 text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <QrCode size={Math.round(size * 0.65)} strokeWidth={2.2} />
                </div>
            );

        case 'bank':
        case 'bank_transfer':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-blue-700 text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <Landmark size={Math.round(size * 0.65)} strokeWidth={2.2} />
                </div>
            );

        case 'upi_india':
        case 'upi':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-[#097939] via-[#000000] to-[#F47920] text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <span className="text-[10px] sm:text-xs font-black tracking-tighter">UPI</span>
                </div>
            );

        case 'eps':
            return (
                <div 
                    className={`rounded-xl flex flex-col items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-[#0052cc] via-[#0065ff] to-[#00b8d9] text-white p-0.5 ${className}`}
                    style={{ width: size, height: size }}
                >
                    <span className="text-[11px] sm:text-xs font-black tracking-wider text-white leading-none">EPS</span>
                    <span className="text-[5.5px] sm:text-[6px] font-bold text-cyan-200 leading-none">PAYMENT</span>
                </div>
            );

        case 'sslcommerz':
            return (
                <div 
                    className={`rounded-xl flex flex-col items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-[#003B73] via-[#005B96] to-[#0b2447] text-white p-0.5 ${className}`}
                    style={{ width: size, height: size }}
                >
                    <span className="text-[9px] sm:text-[10px] font-black tracking-tighter text-amber-300 leading-none">SSL</span>
                    <span className="text-[6px] sm:text-[7px] font-extrabold tracking-tight text-white leading-none uppercase">COMMERZ</span>
                </div>
            );

        case 'aamarpay':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-purple-700 to-indigo-600 text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <span className="text-[9px] sm:text-[10px] font-black tracking-tighter text-white">aamar</span>
                </div>
            );

        case 'uddoktapay':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-[#0284c7] to-[#0ea5e9] text-white p-1 ${className}`}
                    style={{ width: size, height: size }}
                >
                    <span className="text-[8px] sm:text-[9.5px] font-black tracking-tight leading-none text-white">Uddokta</span>
                </div>
            );

        case 'manual_bkash':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-[#E2136E] text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="50,15 90,80 50,65 10,80" />
                        <circle cx="50" cy="45" r="8" fill="#ffffff" />
                        <path d="M30,80 L50,40 L70,80 Z" fill="#ffffff" opacity="0.9" />
                    </svg>
                </div>
            );

        case 'manual_nagad':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-[#ED1C24] to-[#F7941D] text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 15 C30 15 15 30 15 50 C15 70 30 85 50 85 C65 85 75 75 75 60 C75 45 60 40 50 40 C40 40 35 45 35 50 C35 55 40 60 45 60 C50 60 55 55 55 50" stroke="#ffffff" strokeWidth="10" fill="none" strokeLinecap="round" />
                    </svg>
                </div>
            );

        case 'manual_rocket':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-[#8C3494] text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 10 C60 30 75 50 75 70 C75 85 65 90 50 85 C35 90 25 85 25 70 C25 50 40 30 50 10 Z" fill="#ffffff" />
                        <circle cx="50" cy="50" r="10" fill="#8C3494" />
                        <polygon points="50,85 40,95 60,95" fill="#F39C12" />
                    </svg>
                </div>
            );

        case 'shurjopay':
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-gradient-to-tr from-amber-500 to-red-600 text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <span className="text-[9px] sm:text-[10px] font-black tracking-tighter text-white">shurjo</span>
                </div>
            );

        case 'cod':
        default:
            return (
                <div 
                    className={`rounded-xl flex items-center justify-center font-black shrink-0 overflow-hidden shadow-xs bg-emerald-600 text-white ${className}`}
                    style={{ width: size, height: size }}
                >
                    <Banknote size={Math.round(size * 0.65)} strokeWidth={2.2} />
                </div>
            );
    }
}
