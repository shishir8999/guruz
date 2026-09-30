export interface CurrencyInfo {
    code: string;
    symbol: string;
    rate: number;
    is_inr: boolean;
    country: string;
}

export function formatCurrencyPrice(
    amountInBdt: number | string | null | undefined,
    currency?: CurrencyInfo | null
): string {
    const numericAmount = typeof amountInBdt === 'number' 
        ? amountInBdt 
        : parseFloat(String(amountInBdt || 0));

    if (isNaN(numericAmount)) return currency?.symbol ? `${currency.symbol} 0` : '৳ 0';

    if (currency?.is_inr) {
        const inrAmount = Math.round(numericAmount * (currency.rate || 0.72));
        return `₹ ${inrAmount.toLocaleString('en-IN')}`;
    }

    const bdtAmount = Math.round(numericAmount);
    return `৳ ${bdtAmount.toLocaleString('en-BD')}`;
}
