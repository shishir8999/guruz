import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CurrencyCode = 'BDT' | 'INR' | 'USD';

interface CurrencyState {
    currency: CurrencyCode;
    rate: number; // Conversion multiplier relative to BDT
    symbol: string;
    setCurrency: (currency: CurrencyCode) => void;
    formatPrice: (amountInBDT: number | string | null | undefined) => string;
    convertPrice: (amountInBDT: number | string | null | undefined) => number;
    detectLocation: () => Promise<void>;
    syncWithServer: (serverCurrency?: { code: CurrencyCode; rate?: number; symbol?: string; inr_rate?: number }) => void;
}

export const currencyRates: Record<CurrencyCode, { rate: number; symbol: string }> = {
    BDT: { rate: 1.0, symbol: '৳' },
    INR: { rate: 0.72, symbol: '₹' }, // 1000 BDT ≈ 720 INR
    USD: { rate: 0.00833, symbol: '$' }, // 1200 BDT ≈ 10.00 USD
};

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            currency: 'BDT',
            rate: 1.0,
            symbol: '৳',
            setCurrency: (code: CurrencyCode) => {
                const info = currencyRates[code] || currencyRates.BDT;
                const currentRate = get().rate && get().currency === code ? get().rate : info.rate;
                set({ currency: code, rate: currentRate, symbol: info.symbol });
                try {
                    localStorage.setItem('app-currency-detected', 'USER_SET');
                    document.cookie = `user_currency=${code}; path=/; max-age=31536000`;
                } catch {}
            },
            convertPrice: (amountInBDT: number | string | null | undefined) => {
                const num = typeof amountInBDT === 'number' ? amountInBDT : parseFloat(String(amountInBDT || 0));
                if (isNaN(num)) return 0;
                const { rate, currency } = get();
                const converted = num * rate;
                if (currency === 'USD') {
                    return Math.round(converted * 100) / 100;
                }
                return Math.round(converted);
            },
            formatPrice: (amountInBDT: number | string | null | undefined) => {
                const num = typeof amountInBDT === 'number' ? amountInBDT : parseFloat(String(amountInBDT || 0));
                if (isNaN(num)) return `${get().symbol} 0`;
                
                const { rate, symbol, currency } = get();
                const converted = num * rate;

                if (currency === 'USD') {
                    return `${symbol} ${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }

                if (currency === 'INR') {
                    return `${symbol} ${Math.round(converted).toLocaleString('en-IN')}`;
                }

                return `${symbol} ${Math.round(converted).toLocaleString('en-BD')}`;
            },
            syncWithServer: (serverCurrency) => {
                if (serverCurrency && serverCurrency.code && currencyRates[serverCurrency.code]) {
                    const info = currencyRates[serverCurrency.code];
                    const activeRate = (serverCurrency.code === 'INR' && serverCurrency.inr_rate) 
                        ? serverCurrency.inr_rate 
                        : (serverCurrency.rate || info.rate);

                    set({ 
                        currency: serverCurrency.code, 
                        rate: activeRate, 
                        symbol: serverCurrency.symbol || info.symbol 
                    });
                }
            },
            detectLocation: async () => {
                // Handled globally by detectVisitorCountryAndApply
            },
        }),
        {
            name: 'app-currency',
        }
    )
);
