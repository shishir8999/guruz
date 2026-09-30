import { Head, Link, useForm } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { TopNoticeBar } from '@/Components/TopNoticeBar';
import { NoticeMarquee } from '@/Components/NoticeMarquee';
import { useCartStore } from '@/lib/cart';
import { useCurrencyStore } from '@/lib/currency';
import { 
    MapPin, CreditCard, Truck, ChevronRight, ChevronDown, Smartphone, Copy, Check, 
    QrCode, Landmark, ShieldCheck, AlertCircle, Tag, User, Phone, Mail,
    Zap, CheckCircle2, ArrowRight, ExternalLink, RefreshCw
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { GatewayLogo } from '@/Components/PaymentGatewayIcons';
import Swal from 'sweetalert2';

interface DeliveryChargeOption {
    id: number;
    code: string;
    title: string;
    title_en?: string;
    charge: number;
    estimated_days?: string;
    is_default: boolean;
}

interface CheckoutProps {
    auth: { user: any };
    defaultShipping?: {
        name?: string;
        email?: string;
        phone?: string;
        city?: string;
        address?: string;
    };
    availableOffers?: any[];
    walletBalance?: number;
    isFirstOrder?: boolean;
    settings?: any;
    gateways?: any[];
    userCurrency?: string;
    deliveryCharges?: DeliveryChargeOption[];
    freeDeliveryAbove?: number;
}

export default function Checkout({ 
    auth, 
    defaultShipping,
    availableOffers, 
    walletBalance = 0, 
    isFirstOrder = false,
    settings, 
    gateways = [],
    userCurrency = 'BDT',
    deliveryCharges = [],
    freeDeliveryAbove = 0
}: CheckoutProps) {
    const { currency, symbol, formatPrice, convertPrice, rate } = useCurrencyStore();
    const isINR = currency === 'INR' || userCurrency === 'INR';

    const items = useCartStore(s => s.items);
    const clearCart = useCartStore(s => s.clear);
    const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [selectedBanglaBank, setSelectedBanglaBank] = useState<string>('cellfin');
    const [isSimulatingBqr, setIsSimulatingBqr] = useState<boolean>(false);

    const handleCopy = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        setTimeout(() => {
            setCopiedText(null);
        }, 2500);
    };

    // Only allow gateways that exist and are configured in Super Admin panel
    const SUPER_ADMIN_GATEWAY_CODES = [
        'cod', 'bkash', 'sslcommerz',
        'manual_bkash', 'nagad', 'rocket', 'bank', 'upi_india'
    ];

    // Default Fallback Gateways if database list is empty
    const defaultGateways = [
        { code: 'upi_india', name: 'Instant UPI (India)', name_bn: 'ইউপিআই পেমেন্ট (ভারত 🇮🇳)', is_active: true, account_number: settings?.indiaUpiId || 'guruzbd@upi', account_type: 'UPI ID', sort_order: 1 },
        { code: 'cod', name: 'Cash on Delivery', name_bn: 'ক্যাশ অন ডেলিভারি', is_active: true, sort_order: 2 },
        { code: 'bkash', name: 'bKash Merchant', name_bn: 'বিকাশ পেমেন্ট', is_active: true, sort_order: 3 },
        { code: 'sslcommerz', name: 'SSLCommerz', name_bn: 'এসএসএল কমার্জ', is_active: true, sort_order: 4 },
        { code: 'manual_bkash', name: 'Manual bKash', name_bn: 'ম্যানুয়াল বিকাশ', is_active: true, account_number: settings?.manualBkashNumber || '01700000000', account_type: 'Personal', sort_order: 7 },
        { code: 'nagad', name: 'Nagad', name_bn: 'নগদ', is_active: true, account_number: settings?.manualNagadNumber || '01700000000', account_type: 'Personal', sort_order: 8 },
        { code: 'rocket', name: 'Rocket', name_bn: 'রকেট', is_active: true, account_number: settings?.manualRocketNumber || '01700000000', account_type: 'Personal', sort_order: 9 },
        { code: 'bank', name: 'Bank Transfer', name_bn: 'ব্যাংক ট্রান্সফার', is_active: true, bank_name: 'Islami Bank Bangladesh PLC', account_holder_name: 'Guruz BD Limited', account_number: '20501234567890', branch_name: 'Uttara, Dhaka', sort_order: 10 },
    ];

    const activeGateways = useMemo(() => {
        let list: any[] = [];
        if (gateways && gateways.length > 0) {
            list = gateways.filter((g: any) => g.is_active !== false && SUPER_ADMIN_GATEWAY_CODES.includes(g.code));
        } else {
            list = [...defaultGateways];
        }

        // Always make sure upi_india is present
        const hasUpi = list.some((g: any) => g.code === 'upi_india');
        if (!hasUpi) {
            list.push({
                code: 'upi_india',
                name: 'Instant UPI (India)',
                name_bn: 'ইউপিআই পেমেন্ট (ভারত 🇮🇳)',
                is_active: true,
                account_number: settings?.indiaUpiId || 'guruzbd@upi',
                account_type: 'UPI ID',
                sort_order: 1,
            });
        }

        if (isINR) {
            // For Indian visitors, place UPI at the top
            return [...list].sort((a, b) => {
                if (a.code === 'upi_india') return -1;
                if (b.code === 'upi_india') return 1;
                return 0;
            });
        }

        return list;
    }, [gateways, settings, isINR]);

    const initialMethod = isINR ? 'upi_india' : (activeGateways[0]?.code || 'cod');

    // Auto-populate from defaultShipping or auth.user
    const initialName = defaultShipping?.name || auth?.user?.name || '';
    const initialEmail = defaultShipping?.email || auth?.user?.email || '';
    const initialPhone = defaultShipping?.phone || auth?.user?.phone || (auth?.user as any)?.profile?.phone || '';
    const initialCity = defaultShipping?.city || (auth?.user as any)?.city || (auth?.user as any)?.profile?.city || (isINR ? 'Kolkata' : '');
    const initialAddress = defaultShipping?.address || auth?.user?.address || (auth?.user as any)?.profile?.address || '';

    // Default delivery charges fallback
    const defaultDeliveryCharges: DeliveryChargeOption[] = useMemo(() => [
        { id: 1, code: 'inside_dhaka', title: 'ঢাকার ভিতরে', title_en: 'Inside Dhaka', charge: 80, estimated_days: '২-৩ দিন', is_default: true },
        { id: 2, code: 'outside_dhaka', title: 'ঢাকার বাইরে', title_en: 'Outside Dhaka', charge: 120, estimated_days: '৩-৫ দিন', is_default: false },
    ], []);

    const availableDeliveryCharges = useMemo(() => {
        if (deliveryCharges && deliveryCharges.length > 0) {
            return deliveryCharges;
        }
        return defaultDeliveryCharges;
    }, [deliveryCharges, defaultDeliveryCharges]);

    const initialDefaultZone = useMemo(() => {
        const found = availableDeliveryCharges.find(dc => dc.is_default);
        return found ? found.code : 'inside_dhaka';
    }, [availableDeliveryCharges]);

    const [selectedDeliveryZone, setSelectedDeliveryZone] = useState<string>(initialDefaultZone);

    const currentDeliveryOption = useMemo(() => {
        return availableDeliveryCharges.find(dc => dc.code === selectedDeliveryZone) || availableDeliveryCharges[0];
    }, [availableDeliveryCharges, selectedDeliveryZone]);

    const rawShippingFee = Number(currentDeliveryOption?.charge) || 80;
    const isFreeShipping = Number(freeDeliveryAbove) > 0 && subtotal >= Number(freeDeliveryAbove);
    const shippingFee = isFreeShipping ? 0 : rawShippingFee;

    const { data, setData, post, processing, errors, transform } = useForm({
        customer_name: initialName,
        customer_email: initialEmail,
        customer_phone: initialPhone,
        shipping_address: initialAddress,
        city: initialCity,
        zone: '',
        delivery_zone: initialDefaultZone,
        payment_method: initialMethod,
        payment_trx_id: '',
        payment_sender_number: '',
        notes: '',
        coupon_code: '',
        use_wallet: false,
        wallet_amount: 10,
        items: items,
        currency: isINR ? 'INR' : 'BDT',
    });

    React.useEffect(() => {
        setData('items', items);
    }, [items]);

    React.useEffect(() => {
        setData('delivery_zone', selectedDeliveryZone);
    }, [selectedDeliveryZone]);

    React.useEffect(() => {
        setData('currency', isINR ? 'INR' : 'BDT');
        if (isINR && data.payment_method === 'cod') {
            setData('payment_method', 'upi_india');
        }
    }, [isINR]);

    React.useEffect(() => {
        if (!data.customer_name && initialName) setData('customer_name', initialName);
        if (!data.customer_email && initialEmail) setData('customer_email', initialEmail);
        if (!data.customer_phone && initialPhone) setData('customer_phone', initialPhone);
        if (!data.city && initialCity) setData('city', initialCity);
        if (!data.shipping_address && initialAddress) setData('shipping_address', initialAddress);
    }, [defaultShipping, auth?.user]);

    const isCouponSystemEnabled = settings?.coupon_system_enabled !== false;

    const selectedOffer = useMemo(() => {
        if (!isCouponSystemEnabled || !availableOffers) return null;
        return availableOffers.find((o: any) => o.promo_code === data.coupon_code);
    }, [data.coupon_code, availableOffers, isCouponSystemEnabled]);

    const couponDiscount = useMemo(() => {
        if (!selectedOffer) return 0;
        if (selectedOffer.min_order_amount && subtotal < selectedOffer.min_order_amount) return 0;
        if (selectedOffer.type === 'fixed') {
            return Math.min(subtotal, Number(selectedOffer.discount_amount) || 0);
        }
        const pctDiscount = Math.round(subtotal * ((Number(selectedOffer.discount_percentage) || 0) / 100));
        if (selectedOffer.max_discount_amount && Number(selectedOffer.max_discount_amount) > 0) {
            return Math.min(pctDiscount, Number(selectedOffer.max_discount_amount));
        }
        return pctDiscount;
    }, [selectedOffer, subtotal]);
    const remainingBeforeWallet = Math.max(0, subtotal + shippingFee - couponDiscount);
    const perOrderWalletDiscount = Math.min(10, walletBalance, remainingBeforeWallet);
    const walletDiscount = data.use_wallet && walletBalance > 0 ? perOrderWalletDiscount : 0;
    const discountAmount = couponDiscount + walletDiscount;
    const finalTotal = Math.max(0, remainingBeforeWallet - walletDiscount);

    // Selected gateway details
    const selectedGateway = useMemo(() => {
        return activeGateways.find((g: any) => g.code === data.payment_method) || activeGateways[0];
    }, [data.payment_method, activeGateways]);

    // Manual payment methods separation and dropdown state
    const MANUAL_GATEWAY_CODES = ['manual_bkash', 'nagad', 'rocket', 'bank', 'upi_india'];
    const [isManualExpanded, setIsManualExpanded] = useState(false);

    const { primaryGateways, manualGateways } = useMemo(() => {
        if (isINR) {
            return {
                primaryGateways: activeGateways.filter((g: any) => g.code === 'upi_india'),
                manualGateways: activeGateways.filter((g: any) => g.code !== 'upi_india'),
            };
        }
        return {
            primaryGateways: activeGateways.filter((g: any) => !MANUAL_GATEWAY_CODES.includes(g.code)),
            manualGateways: activeGateways.filter((g: any) => MANUAL_GATEWAY_CODES.includes(g.code)),
        };
    }, [activeGateways, isINR]);

    const isManualSelected = useMemo(() => {
        return manualGateways.some((g: any) => g.code === data.payment_method);
    }, [manualGateways, data.payment_method]);

    const selectedManualGateway = useMemo(() => {
        return manualGateways.find((g: any) => g.code === data.payment_method);
    }, [manualGateways, data.payment_method]);

    // Client validation errors state
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    // Manual coupon input states
    const [manualCouponInput, setManualCouponInput] = useState('');
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [couponApplying, setCouponApplying] = useState(false);

    const clearFieldError = (fieldName: string) => {
        setClientErrors(prev => {
            if (!prev[fieldName]) return prev;
            const next = { ...prev };
            delete next[fieldName];
            return next;
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let firstInvalidId = '';

        // 1. Full Name
        if (!data.customer_name || !data.customer_name.trim()) {
            newErrors.customer_name = 'অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন';
            if (!firstInvalidId) firstInvalidId = 'input-customer-name';
        }

        // 2. Mobile Phone (Supports BD 11-digit or India 10-digit format)
        const rawPhone = (data.customer_phone || '').trim();
        const cleanDigits = rawPhone.replace(/\D/g, '');
        
        let validPhone = false;
        if (cleanDigits.length === 11 && /^01[3-9]\d{8}$/.test(cleanDigits)) {
            validPhone = true;
        } else if (cleanDigits.length === 13 && /^8801[3-9]\d{8}$/.test(cleanDigits)) {
            validPhone = true;
        } else if (cleanDigits.length === 10 && /^1[3-9]\d{8}$/.test(cleanDigits)) {
            validPhone = true;
        } else if (cleanDigits.length === 10 && /^[6-9]\d{9}$/.test(cleanDigits)) {
            // Indian standard 10-digit mobile number
            validPhone = true;
        } else if (cleanDigits.length === 12 && /^91[6-9]\d{9}$/.test(cleanDigits)) {
            // Indian standard with 91 country code
            validPhone = true;
        }

        if (!rawPhone) {
            newErrors.customer_phone = 'মোবাইল নম্বর দেওয়া আবশ্যক';
            if (!firstInvalidId) firstInvalidId = 'input-customer-phone';
        } else if (!validPhone) {
            newErrors.customer_phone = isINR 
                ? 'সঠিক ১০ ডিজিটের ভারতীয় মোবাইল নম্বর দিন (যেমন: 98XXXXXXXX)'
                : 'কান্ট্রি কোডসহ সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
            if (!firstInvalidId) firstInvalidId = 'input-customer-phone';
        }

        // 3. City / District
        if (!data.city || !data.city.trim()) {
            newErrors.city = 'অনুগ্রহ করে শহর অথবা জেলার নাম লিখুন';
            if (!firstInvalidId) firstInvalidId = 'input-city';
        }

        // 4. Shipping Address
        if (!data.shipping_address || !data.shipping_address.trim()) {
            newErrors.shipping_address = 'সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন';
            if (!firstInvalidId) firstInvalidId = 'input-shipping-address';
        }

        // 5. Payment details if mobile banking or UPI
        if (['manual_bkash', 'nagad', 'rocket', 'upi_india'].includes(data.payment_method)) {
            if (!data.payment_trx_id || !data.payment_trx_id.trim()) {
                newErrors.payment_trx_id = data.payment_method === 'upi_india' 
                    ? 'ইউপিআই রেফারেন্স/UTR নম্বর প্রদান করুন' 
                    : 'ট্রানজেকশন আইডি (TrxID) প্রদান করুন';
                if (!firstInvalidId) firstInvalidId = 'input-payment-trx-id';
            }
            if (!data.payment_sender_number || !data.payment_sender_number.trim()) {
                newErrors.payment_sender_number = data.payment_method === 'upi_india' 
                    ? 'আপনার ইউপিআই আইডি বা মোবাইল নম্বর দিন' 
                    : 'প্রেরক বা অ্যাকাউন্ট নম্বর প্রদান করুন';
                if (!firstInvalidId) firstInvalidId = 'input-payment-sender-number';
            }
        }

        setClientErrors(newErrors);

        if (firstInvalidId) {
            const targetElement = document.getElementById(firstInvalidId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    targetElement.focus();
                }, 300);
            }

            Swal.fire({
                title: 'প্রয়োজনীয় তথ্য বাকি আছে!',
                text: 'অনুগ্রহ করে লাল চিহ্নিত অপশনগুলো সঠিকভাবে পূরণ করুন।',
                icon: 'warning',
                toast: true,
                position: 'top-end',
                timer: 4000,
                showConfirmButton: false,
                timerProgressBar: true,
            });

            return false;
        }

        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        if (!items || items.length === 0) {
            Swal.fire({
                title: 'কার্ট খালি!',
                text: 'অর্ডার করার জন্য কার্টে পণ্য থাকতে হবে। অনুগ্রহ করে পণ্য সিলেক্ট করুন।',
                icon: 'warning',
                confirmButtonColor: '#059669',
            });
            return;
        }

        transform((currData) => ({
            ...currData,
            items: items,
        }));

        post('/checkout', {
            onSuccess: () => clearCart(),
            onError: (errs) => {
                const firstErr = Object.values(errs)[0];
                if (firstErr) {
                    Swal.fire({
                        title: 'অর্ডার সম্পন্ন করা যায়নি',
                        text: String(firstErr),
                        icon: 'error',
                        confirmButtonColor: '#e11d48',
                    });
                }
            }
        });
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
                <Head title="Checkout — Guruz" />
                <TopNoticeBar />
                <NoticeMarquee />
                <Header />
                <main className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center py-16 px-6 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md w-full space-y-4">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">
                            🛒
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">আপনার কার্ট খালি</h2>
                        <p className="text-xs text-slate-500 font-medium">অর্ডার করতে অনুগ্রহ করে কিছু পণ্য কার্টে যোগ করুন।</p>
                        <Link 
                            href="/products" 
                            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-sm shadow-md shadow-emerald-600/20 transition"
                        >
                            পণ্য ব্রাউজ করুন
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fb] text-slate-800 flex flex-col justify-between font-sans">
            <Head title="Checkout — Guruz" />
            
            <div>
                <TopNoticeBar />
                <NoticeMarquee />
                <Header />

                <main className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                            <CreditCard size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
                            <p className="text-xs text-slate-500 font-semibold">আপনার তথ্য পূরণ করে অর্ডার কনফার্ম করুন</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left: Shipping + Payment */}
                            <div className="lg:col-span-2 space-y-6">
                                
                                {/* ─── SHIPPING DETAILS ─── */}
                                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                                    <h2 className="font-black text-lg text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                                        <MapPin className="w-5 h-5 text-emerald-600" /> 
                                        <span>ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য (Shipping Details)</span>
                                    </h2>

                                    {Boolean(initialAddress || initialCity) && (
                                        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800 shadow-2xs">
                                            <span className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                <span>আপনার প্রোফাইল থেকে সংরক্ষিত ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য স্বয়ংক্রিয়ভাবে যুক্ত করা হয়েছে।</span>
                                            </span>
                                            <Link href="/account/profile" className="text-emerald-700 hover:text-emerald-900 font-extrabold underline text-[11px] shrink-0">
                                                ঠিকানা এডিট করুন
                                            </Link>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                                                <User size={13} className="text-slate-400" />
                                                <span>সম্পূর্ণ নাম (Full Name) <span className="text-rose-500">*</span></span>
                                            </label>
                                            <input
                                                id="input-customer-name"
                                                type="text"
                                                value={data.customer_name}
                                                onChange={e => {
                                                    setData('customer_name', e.target.value);
                                                    clearFieldError('customer_name');
                                                }}
                                                placeholder="আপনার পূর্ণ নাম"
                                                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition ${
                                                    clientErrors.customer_name || errors.customer_name
                                                        ? 'border-rose-500 bg-rose-50/50 ring-4 ring-rose-500/20 text-rose-900 placeholder:text-rose-300'
                                                        : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900'
                                                }`}
                                            />
                                            {(clientErrors.customer_name || errors.customer_name) && (
                                                <p className="text-rose-600 text-xs mt-1.5 font-bold flex items-center gap-1 animate-in fade-in-50">
                                                    <AlertCircle size={13} className="shrink-0 stroke-[2.5]" />
                                                    <span>{clientErrors.customer_name || errors.customer_name}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                                                <Phone size={13} className="text-slate-400" />
                                                <span>মোবাইল নম্বর (Phone Number) <span className="text-rose-500">*</span></span>
                                            </label>
                                            <div className={`flex rounded-xl border transition shadow-2xs overflow-hidden ${
                                                clientErrors.customer_phone || errors.customer_phone
                                                    ? 'border-rose-500 ring-4 ring-rose-500/20 bg-rose-50/50'
                                                    : 'border-slate-200 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500'
                                            }`}>
                                                <div className="flex items-center gap-1 px-3 bg-slate-100/90 border-r border-slate-200 text-slate-700 font-black text-xs select-none shrink-0">
                                                    <span>{isINR ? '🇮🇳' : '🇧🇩'}</span>
                                                    <span>{isINR ? '+91' : '+880'}</span>
                                                </div>
                                                <input
                                                    id="input-customer-phone"
                                                    type="tel"
                                                    maxLength={15}
                                                    value={data.customer_phone}
                                                    onChange={e => {
                                                        const raw = e.target.value.replace(/[^\d+]/g, '');
                                                        setData('customer_phone', raw);
                                                        clearFieldError('customer_phone');
                                                    }}
                                                    placeholder={isINR ? "98XXXXXXXX (১০ ডিজিট)" : "01XXXXXXXXX (১১ ডিজিট)"}
                                                    className="w-full px-4 py-3 bg-transparent focus:outline-none text-sm font-bold text-slate-900"
                                                />
                                            </div>
                                            {(clientErrors.customer_phone || errors.customer_phone) && (
                                                <p className="text-rose-600 text-xs mt-1.5 font-bold flex items-center gap-1 animate-in fade-in-50">
                                                    <AlertCircle size={13} className="shrink-0 stroke-[2.5]" />
                                                    <span>{clientErrors.customer_phone || errors.customer_phone}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                                                <Mail size={13} className="text-slate-400" />
                                                <span>ইমেইল এড্রেস (Email Address)</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={data.customer_email}
                                                onChange={e => setData('customer_email', e.target.value)}
                                                placeholder="you@email.com"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-slate-900 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1">
                                                <MapPin size={13} className="text-slate-400" />
                                                <span>শহর / জেলা (City / District) <span className="text-rose-500">*</span></span>
                                            </label>
                                            <input
                                                id="input-city"
                                                type="text"
                                                value={data.city}
                                                onChange={e => {
                                                    setData('city', e.target.value);
                                                    clearFieldError('city');
                                                }}
                                                placeholder={isINR ? "যেমন: Kolkata / Mumbai / Delhi" : "যেমন: ঢাকা / চট্টগ্রাম"}
                                                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition ${
                                                    clientErrors.city || errors.city
                                                        ? 'border-rose-500 bg-rose-50/50 ring-4 ring-rose-500/20 text-rose-900 placeholder:text-rose-300'
                                                        : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900'
                                                }`}
                                            />
                                            {(clientErrors.city || errors.city) && (
                                                <p className="text-rose-600 text-xs mt-1.5 font-bold flex items-center gap-1 animate-in fade-in-50">
                                                    <AlertCircle size={13} className="shrink-0 stroke-[2.5]" />
                                                    <span>{clientErrors.city || errors.city}</span>
                                                </p>
                                            )}
                                        </div>

                                        {/* Delivery Zone Selector in Step 1 */}
                                        <div className="sm:col-span-2 space-y-2">
                                            <label className="block text-xs font-black text-slate-700 flex items-center justify-between">
                                                <span className="flex items-center gap-1">
                                                    <Truck size={14} className="text-emerald-600" />
                                                    <span>ডেলিভারি এরিয়া (Delivery Zone) <span className="text-rose-500">*</span></span>
                                                </span>
                                                {isFreeShipping && (
                                                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                        ফ্রি ডেলিভারি অফার কার্যকর 🎉
                                                    </span>
                                                )}
                                            </label>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {availableDeliveryCharges.map((dc) => {
                                                    const isSelected = selectedDeliveryZone === dc.code;
                                                    const chargeText = isFreeShipping ? 'ফ্রি ডেলিভারি' : formatPrice(dc.charge);
                                                    return (
                                                        <div
                                                            key={dc.code}
                                                            onClick={() => {
                                                                setSelectedDeliveryZone(dc.code);
                                                                setData('delivery_zone', dc.code);
                                                                if (dc.code === 'inside_dhaka' && (!data.city || data.city === 'Outside Dhaka')) {
                                                                    setData('city', 'Dhaka');
                                                                }
                                                            }}
                                                            className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 select-none ${
                                                                isSelected
                                                                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-4 ring-emerald-500/10'
                                                                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100/50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                                    isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                                                                }`}>
                                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className={`text-xs sm:text-sm font-black truncate ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                                                                        {dc.title}
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-400 font-medium">
                                                                        {dc.estimated_days || (dc.code === 'inside_dhaka' ? '২-৩ দিন' : '৩-৫ দিন')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`text-xs sm:text-sm font-black shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-700'}`}>
                                                                {chargeText}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-black text-slate-700 mb-1.5">
                                                সম্পূর্ণ ঠিকানা (Full Delivery Address) <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                id="input-shipping-address"
                                                value={data.shipping_address}
                                                onChange={e => {
                                                    setData('shipping_address', e.target.value);
                                                    clearFieldError('shipping_address');
                                                }}
                                                placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, থানা..."
                                                rows={2}
                                                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium resize-none transition ${
                                                    clientErrors.shipping_address || errors.shipping_address
                                                        ? 'border-rose-500 bg-rose-50/50 ring-4 ring-rose-500/20 text-rose-900 placeholder:text-rose-300'
                                                        : 'border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900'
                                                }`}
                                            />
                                            {(clientErrors.shipping_address || errors.shipping_address) && (
                                                <p className="text-rose-600 text-xs mt-1.5 font-bold flex items-center gap-1 animate-in fade-in-50">
                                                    <AlertCircle size={13} className="shrink-0 stroke-[2.5]" />
                                                    <span>{clientErrors.shipping_address || errors.shipping_address}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ─── PAYMENT METHOD SELECTION (MATCHING SCREENSHOT) ─── */}
                                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
                                    {/* Step 2 Header */}
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                        <div className="w-8 h-8 rounded-full bg-[#d61e38] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                                            2
                                        </div>
                                        <div>
                                            <h2 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                                                পেমেন্ট পদ্ধতি
                                            </h2>
                                            <p className="text-xs text-slate-400 font-medium">
                                                আপনার পছন্দের পেমেন্ট বেছে নিন
                                            </p>
                                        </div>
                                    </div>

                                    {/* Primary & Manual Payment Methods List */}
                                    <div className="space-y-3">
                                        {/* 1. Primary Always-Visible Gateways */}
                                        {primaryGateways.map((gw: any) => {
                                            const isSelected = data.payment_method === gw.code;
                                            const subtitle = gw.instructions || (
                                                gw.code === 'upi_india' ? 'PhonePe, Google Pay, Paytm, BHIM ইউপিআই দিয়ে পেমেন্ট' :
                                                gw.code === 'cod' ? 'পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন' :
                                                gw.code === 'bkash' ? 'বিকাশ অনলাইন গেটওয়ে (ইনস্ট্যান্ট পেমেন্ট)' :
                                                gw.code === 'sslcommerz' ? 'কার্ড, ইন্টারনেট ব্যাংকিং ও মোবাইল ওয়ালেট' :
                                                'অনলাইন গেটওয়ে পেমেন্ট'
                                            );

                                            return (
                                                <div
                                                    key={gw.code}
                                                    onClick={() => setData('payment_method', gw.code)}
                                                    className={`w-full p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 select-none ${
                                                        isSelected 
                                                            ? 'border-2 border-[#d61e38] bg-emerald-50/20 shadow-xs ring-4 ring-rose-500/10' 
                                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                                                    }`}
                                                >
                                                    {/* Left: Icon/Logo + Title + Subtitle */}
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className="shrink-0">
                                                            {gw.logo_url ? (
                                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-2xs overflow-hidden p-1">
                                                                    <GatewayLogo code={gw.code} customUrl={gw.logo_url} size={38} />
                                                                </div>
                                                            ) : gw.code === 'cod' ? (
                                                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80 shadow-2xs">
                                                                    <Truck className="w-6 h-6 stroke-[2.2]" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-2xs overflow-hidden p-1">
                                                                    <GatewayLogo code={gw.code} customUrl={gw.logo_url} size={38} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 text-left">
                                                            <h3 className={`font-black text-sm sm:text-base leading-snug ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>
                                                                {gw.name_bn || gw.name}
                                                            </h3>
                                                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                                                {subtitle}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Right: Radio Circle */}
                                                    <div className="shrink-0">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                            isSelected 
                                                                ? 'border-[#d61e38]' 
                                                                : 'border-slate-300'
                                                        }`}>
                                                            {isSelected && (
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#d61e38]" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* 2. Collapsible Manual Payment Methods Dropdown */}
                                        {manualGateways.length > 0 && (
                                            <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                                                isManualSelected
                                                    ? 'border-[#d61e38] bg-rose-50/15 shadow-2xs ring-2 ring-rose-500/10'
                                                    : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                                            }`}>
                                                {/* Dropdown Header / Accordion Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => setIsManualExpanded(prev => !prev)}
                                                    className={`w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer select-none transition-colors ${
                                                        isManualSelected ? 'bg-rose-50/30' : 'hover:bg-slate-100/60'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <div className="shrink-0">
                                                            {settings?.manualDropdownLogo ? (
                                                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-2xs overflow-hidden p-1">
                                                                    <img src={settings.manualDropdownLogo} alt="Manual" className="w-full h-full object-contain rounded-lg" />
                                                                </div>
                                                            ) : (
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-all ${
                                                                    isManualSelected
                                                                        ? 'bg-rose-50 border-rose-200 text-[#d61e38]'
                                                                        : 'bg-white border-slate-200 text-slate-600'
                                                                }`}>
                                                                    <Smartphone className="w-6 h-6 stroke-[2]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h3 className="font-black text-sm sm:text-base text-slate-800 leading-snug">
                                                                    ম্যানুয়াল পেমেন্ট মেথড
                                                                </h3>
                                                                {isManualSelected && selectedManualGateway ? (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d61e38] text-white shadow-2xs">
                                                                        <Check size={12} className="stroke-[3]" />
                                                                        {selectedManualGateway.name_bn || selectedManualGateway.name} নির্বাচিত
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                                                                        বিকাশ, নগদ, রকেট, ব্যাংক
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                                                {isManualSelected
                                                                    ? 'অন্য কোনো ম্যানুয়াল মেথড পরিবর্তন করতে ক্লিক করুন'
                                                                    : 'ক্লিক করে ম্যানুয়াল পেমেন্ট অপশনগুলো বেছে নিন'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                                                            {isManualExpanded ? 'বন্ধ করুন' : 'অপশন দেখুন'}
                                                        </span>
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                                                            isManualExpanded ? 'rotate-180 bg-slate-200 text-slate-800' : 'bg-white border border-slate-200 text-slate-600'
                                                        }`}>
                                                            <ChevronDown size={18} />
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Collapsible Dropdown Content */}
                                                {isManualExpanded && (
                                                    <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-slate-50/70 space-y-2.5 animate-in fade-in-50 duration-150">
                                                        <p className="text-xs font-bold text-slate-500 mb-1">
                                                            নিচের যে কোনো একটি ম্যানুয়াল পেমেন্ট মেথড নির্বাচন করুন:
                                                        </p>
                                                        {manualGateways.map((gw: any) => {
                                                            const isSelected = data.payment_method === gw.code;
                                                            const subtitle = gw.instructions || (
                                                                gw.code === 'manual_bkash' ? 'ম্যানুয়াল সেন্ড মানি — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন' :
                                                                gw.code === 'nagad' ? 'ম্যানুয়াল সেন্ড মানি — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন' :
                                                                gw.code === 'rocket' ? 'ম্যানুয়াল সেন্ড মানি — ট্রানজেকশন আইডি দিয়ে কনফার্ম করুন' :
                                                                gw.code === 'bank' ? 'সরাসরি ব্যাংক একাউন্টে ডিপোজিট করুন' :
                                                                gw.code === 'upi_india' ? 'PhonePe, Google Pay, Paytm, BHIM ইউপিআই' :
                                                                'ম্যানুয়াল পেমেন্ট'
                                                            );

                                                            return (
                                                                <div
                                                                    key={gw.code}
                                                                    onClick={() => setData('payment_method', gw.code)}
                                                                    className={`w-full p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3.5 select-none ${
                                                                        isSelected 
                                                                            ? 'border-2 border-[#d61e38] bg-white shadow-xs ring-4 ring-rose-500/10' 
                                                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center gap-3 min-w-0">
                                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-2xs overflow-hidden p-1 shrink-0">
                                                                            <GatewayLogo code={gw.code} customUrl={gw.logo_url} size={32} />
                                                                        </div>
                                                                        <div className="min-w-0 text-left">
                                                                            <h4 className={`font-black text-sm leading-snug ${isSelected ? 'text-[#d61e38]' : 'text-slate-800'}`}>
                                                                                {gw.name_bn || gw.name}
                                                                            </h4>
                                                                            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                                                                                {subtitle}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="shrink-0">
                                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                                            isSelected ? 'border-[#d61e38]' : 'border-slate-300'
                                                                        }`}>
                                                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#d61e38]" />}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* ─── SELECTED GATEWAY INSTRUCTIONS & INPUTS ─── */}
                                    {selectedGateway && selectedGateway.code !== 'cod' && (
                                        <div className="mt-5 p-5 border border-emerald-500/30 bg-emerald-50/30 rounded-2xl space-y-5">
                                            
                                            {/* Header of selected method */}
                                            <div className="flex items-center gap-3">
                                                <GatewayLogo code={selectedGateway.code} customUrl={selectedGateway.logo_url} size={40} />
                                                <div>
                                                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                                                        <span>{selectedGateway.name}</span>
                                                        {selectedGateway.name_bn && <span className="text-xs text-emerald-700 font-bold">({selectedGateway.name_bn})</span>}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-semibold">
                                                        {selectedGateway.code === 'bank' ? 'ব্যাংক ট্রান্সফারের মাধ্যমে পেমেন্ট করুন' : 
                                                         ['bkash', 'sslcommerz', 'uddoktapay', 'shurjopay', 'aamarpay', 'bangla_qr'].includes(selectedGateway.code) ? 'অনলাইন গেটওয়ের মাধ্যমে সরাসরি পেমেন্ট করুন' :
                                                         'নিচের নম্বরে সেন্ড মানি / পেমেন্ট সম্পন্ন করুন'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 1. bKash Automated Gateway Details (Pure Gateway - No Manual) */}
                                            {selectedGateway.code === 'bkash' && (
                                                <div className="space-y-4">
                                                    <div className="bg-gradient-to-br from-[#E2136E] via-[#c20f5c] to-[#9c0b49] text-white p-5 rounded-3xl shadow-md border border-pink-400/40 space-y-4">
                                                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md">
                                                                    <GatewayLogo code="bkash" size={32} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-sm sm:text-base text-white">
                                                                        bKash পেমেন্ট গেটওয়ে (অটোমেটেড)
                                                                    </h4>
                                                                    <p className="text-[10px] text-pink-100">
                                                                        মার্চেন্ট পেমেন্ট সিস্টেম — কোনো ম্যানুয়াল সেন্ড মানি নয়
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                                                                ইনস্ট্যান্ট ভেরিফিকেশন ⚡
                                                            </span>
                                                        </div>

                                                        <div className="text-xs text-pink-50/95 leading-relaxed">
                                                            অর্ডার কনফার্ম করার পর আপনাকে সরাসরি <strong>বিকাশের অফিসিয়াল সুরক্ষিত গেটওয়েতে</strong> নিয়ে যাওয়া হবে। সেখানে আপনার বিকাশ নম্বর, ওটিপি (OTP) ও পিন দিয়ে সরাসরি অটোমেটিক পেমেন্ট সম্পন্ন করতে পারবেন। কোনো ট্রানজেকশন আইডি বা রেফারেন্স ম্যানুয়ালি দেওয়া লাগবে না।
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold">
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">⚡ ইনস্ট্যান্ট কনফার্মেশন</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">📱 ওটিপি ও পিন ভেরিফিকেশন</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">🎁 ক্যাশব্যাক ও অফার প্রযোজ্য</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">🔒 100% নিরাপদ ও সুরক্ষিত</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. Manual Mobile Banking Details (manual_bkash, nagad, rocket) */}
                                            {['manual_bkash', 'nagad', 'rocket'].includes(selectedGateway.code) && (
                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                                    {selectedGateway.name} {selectedGateway.account_type || 'Personal'} Number
                                                                </p>
                                                                <p className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-wider">
                                                                    {selectedGateway.account_number || (selectedGateway.code === 'manual_bkash' ? settings?.manualBkashNumber : null) || settings?.[`manual${selectedGateway.name}Number`] || '01700000000'}
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(selectedGateway.account_number || (selectedGateway.code === 'manual_bkash' ? settings?.manualBkashNumber : null) || settings?.[`manual${selectedGateway.name}Number`] || '01700000000')}
                                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                                                            >
                                                                {copiedText === (selectedGateway.account_number || settings?.[`manual${selectedGateway.name}Number`] || '01700000000') ? (
                                                                    <>
                                                                        <Check size={14} className="text-emerald-600" />
                                                                        <span className="text-emerald-600">কপি হয়েছে!</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy size={14} />
                                                                        <span>নম্বর কপি করুন</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* QR Code if uploaded */}
                                                        {selectedGateway.qr_image_url && (
                                                            <div className="pt-3 border-t border-slate-100 flex items-center gap-4">
                                                                <div className="w-24 h-24 rounded-xl bg-white border border-slate-200 p-1.5 shrink-0 shadow-xs">
                                                                    <img src={selectedGateway.qr_image_url} alt="QR Code" className="w-full h-full object-contain" />
                                                                </div>
                                                                <p className="text-xs text-slate-600 font-medium">
                                                                    অ্যাপ থেকে এই কিউআর (QR) কোডটি স্ক্যান করেও সরাসরি পেমেন্ট করতে পারেন।
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Instruction Banner */}
                                                    <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
                                                        {selectedGateway.instructions || `দয়া করে ঠিক ${formatPrice(finalTotal)} সেন্ড মানি করুন। তারপর ট্রানজেকশন আইডি (TrxID) ও আপনার প্রেরক নম্বর নিচে প্রদান করুন।`}
                                                    </div>

                                                    {/* TrxID & Sender Inputs */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                                ট্রানজেকশন আইডি (TrxID) <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="input-payment-trx-id"
                                                                value={data.payment_trx_id}
                                                                onChange={e => {
                                                                    setData('payment_trx_id', e.target.value);
                                                                    clearFieldError('payment_trx_id');
                                                                }}
                                                                placeholder="যেমন: BL72X99P"
                                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                            {clientErrors.payment_trx_id && (
                                                                <p className="text-[11px] text-red-600 font-bold mt-1">{clientErrors.payment_trx_id}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                                                প্রেরক নম্বর (Sender Number) <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="input-payment-sender-number"
                                                                value={data.payment_sender_number}
                                                                onChange={e => {
                                                                    setData('payment_sender_number', e.target.value);
                                                                    clearFieldError('payment_sender_number');
                                                                }}
                                                                placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন"
                                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                            {clientErrors.payment_sender_number && (
                                                                <p className="text-[11px] text-red-600 font-bold mt-1">{clientErrors.payment_sender_number}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 2. Bangla QR Direct API Bank Hub Details */}
                                            {selectedGateway.code === 'bangla_qr' && (
                                                <div className="space-y-4">
                                                    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-xl space-y-5">
                                                        {/* Header Banner */}
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
                                                                    <QrCode size={28} />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-black text-white text-base sm:text-lg">
                                                                            ইন্টার-অপারেবল বাংলা কিউআর (Bangla QR)
                                                                        </h4>
                                                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                                                                            বাংলাদেশ ব্যাংক অনুমোদিত 🇧🇩
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-emerald-200/80 font-medium">
                                                                        অ্যাকোয়ারার নেটওয়ার্ক: <strong>{selectedGateway.bank_name || 'Islami Bank Bangladesh PLC'}</strong>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-400/20 rounded-full text-emerald-300 text-xs font-black self-start sm:self-auto">
                                                                <Zap size={13} className="animate-pulse text-amber-400" />
                                                                <span>ইনস্ট্যান্ট এপিআই ভেরিফিকেশন</span>
                                                            </div>
                                                        </div>

                                                        {/* Bank & MFS Selector Tabs */}
                                                        <div>
                                                            <label className="block text-xs font-bold text-emerald-200 mb-2">
                                                                আপনার পছন্দের ব্যাংক অথবা ওয়ালেট অ্যাপ সিলেক্ট করুন:
                                                            </label>
                                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                                                {[
                                                                    { id: 'cellfin', name: 'Cellfin', label: 'ইসলামী ব্যাংক', color: 'hover:border-emerald-400' },
                                                                    { id: 'citytouch', name: 'CityTouch', label: 'সিটি ব্যাংক', color: 'hover:border-rose-400' },
                                                                    { id: 'astha', name: 'Astha', label: 'ব্র্যাক ব্যাংক', color: 'hover:border-amber-400' },
                                                                    { id: 'ebl', name: 'SKYBANKING', label: 'ইস্টার্ন ব্যাংক', color: 'hover:border-blue-400' },
                                                                    { id: 'sonali', name: 'Sonali e-Sheba', label: 'সোনালী ব্যাংক', color: 'hover:border-emerald-400' },
                                                                    { id: 'bkash', name: 'bKash QR', label: 'বিকাশ মার্চেন্ট', color: 'hover:border-pink-400' },
                                                                    { id: 'nagad', name: 'Nagad QR', label: 'নগদ মার্চেন্ট', color: 'hover:border-orange-400' },
                                                                    { id: 'rocket', name: 'Rocket QR', label: 'রকেট মার্চেন্ট', color: 'hover:border-purple-400' },
                                                                    { id: 'all', name: 'All Banks', label: 'যেকোনো ব্যাংক/কার্ড', color: 'hover:border-cyan-400' },
                                                                ].map(bank => {
                                                                    const isSelected = selectedBanglaBank === bank.id;
                                                                    return (
                                                                        <button
                                                                            key={bank.id}
                                                                            type="button"
                                                                            onClick={() => setSelectedBanglaBank(bank.id)}
                                                                            className={`p-2 sm:p-2.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                                                                isSelected 
                                                                                    ? 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md scale-102 ring-2 ring-emerald-400/50' 
                                                                                    : 'bg-white/5 hover:bg-white/10 text-white/90 border-white/10'
                                                                            }`}
                                                                        >
                                                                            <span className="text-xs font-black leading-tight">{bank.name}</span>
                                                                            <span className={`text-[9px] font-bold ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>{bank.label}</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                        {/* Dynamic QR Code Display & Scan Section */}
                                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-col md:flex-row items-center gap-6">
                                                            <div className="relative group shrink-0">
                                                                <div className="w-48 h-48 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center border-4 border-emerald-400/80">
                                                                    <QRCodeSVG
                                                                        value={`00020101021226500016com.banglaqr.bd0111${selectedGateway.api_key || selectedGateway.merchant_id || '01700000000'}0206${selectedGateway.token_id || 'TID001'}0307${selectedBanglaBank}52045399530305054${finalTotal.toFixed(2).length.toString().padStart(2, '0')}${finalTotal.toFixed(2)}5802BD5908Guruz BD6005Dhaka6304ABCD`}
                                                                        size={164}
                                                                        level="H"
                                                                        includeMargin={false}
                                                                    />
                                                                </div>
                                                                <div className="text-center mt-2">
                                                                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 shadow-xs">
                                                                        📷 অ্যাপের QR স্ক্যানার দিয়ে স্ক্যান করুন
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 space-y-3 text-center md:text-left">
                                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded-full border border-emerald-400/30">
                                                                    <span>সর্বমোট প্রদেয় মূল্য: <strong>{formatPrice(finalTotal)}</strong></span>
                                                                </div>

                                                                <h4 className="text-sm sm:text-base font-black text-white">
                                                                    {selectedBanglaBank === 'cellfin' && '🟢 ইসলামী ব্যাংক Cellfin অ্যাপ ওপেন করে Bangla QR স্ক্যান করুন'}
                                                                    {selectedBanglaBank === 'citytouch' && '🔴 CityTouch অ্যাপ ওপেন করে Bangla QR স্ক্যান করুন'}
                                                                    {selectedBanglaBank === 'astha' && '🟡 BRAC Bank Astha অ্যাপ দিয়ে Bangla QR স্ক্যান করুন'}
                                                                    {selectedBanglaBank === 'ebl' && '🔵 EBL SKYBANKING অ্যাপ দিয়ে স্ক্যান করুন'}
                                                                    {selectedBanglaBank === 'sonali' && '🏛️ Sonali e-Sheba অ্যাপ দিয়ে স্ক্যান করুন'}
                                                                    {selectedBanglaBank === 'bkash' && '🟣 বিকাশ অ্যাপ ওপেন করে বাংলা কিউআর স্ক্যান করুন'}
                                                                    {selectedBanglaBank === 'nagad' && '🟠 নগদ অ্যাপ ওপেন করে বাংলা কিউআর স্ক্যান করুন'}
                                                                    {selectedBanglaBank === 'rocket' && '🟣 রকেট অ্যাপ ওপেন করে স্ক্যান করুন'}
                                                                    {selectedBanglaBank === 'all' && '🌐 যেকোনো ব্যাংক বা কার্ড অ্যাপ দিয়ে স্ক্যান করুন'}
                                                                </h4>

                                                                <p className="text-xs text-emerald-100/80 leading-relaxed">
                                                                    কিউআর কোডে নির্ধারিত <strong>{formatPrice(finalTotal)}</strong> এবং মার্চেন্ট আইডি স্বয়ংক্রিয়ভাবে এমবেড করা আছে। পেমেন্ট নিশ্চিত হওয়া মাত্রই কোনো TrxID টাইপ করা ছাড়াই আপনার অর্ডার অটোমেটিক কনফার্ম হয়ে যাবে।
                                                                </p>

                                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                                                                    <a
                                                                        href={`banglaqr://pay?amount=${finalTotal}&merchant=${selectedGateway.api_key || selectedGateway.merchant_id || '01700000000'}&bank=${selectedBanglaBank}`}
                                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                                                                    >
                                                                        <ExternalLink size={14} />
                                                                        <span>মোবাইলে সরাসরি অ্যাপে পেমেন্ট করুন</span>
                                                                    </a>

                                                                    <div className="text-[11px] text-emerald-300 font-mono flex items-center gap-1">
                                                                        <span>মার্চেন্ট আইডি: <strong>{selectedGateway.api_key || selectedGateway.merchant_id || 'BD_MERCHANT_001'}</strong></span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                                                                        {/* 3. SSLCommerz Automated Gateway Details */}
                                            {selectedGateway.code === 'sslcommerz' && (
                                                <div className="space-y-4">
                                                    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-md border border-blue-700/50 space-y-4">
                                                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 font-black text-xs">
                                                                    SSL
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-sm text-white">
                                                                        SSLCommerz অটোমেটেড সিকিউর পেমেন্ট
                                                                    </h4>
                                                                    <p className="text-[10px] text-blue-200">
                                                                        256-Bit Bank Grade Secure Encryption
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                                                                ইনস্ট্যান্ট ভেরিফিকেশন ⚡
                                                            </span>
                                                        </div>

                                                        <div className="text-xs text-blue-100/90 leading-relaxed">
                                                            অর্ডার প্লেস করার পর আপনাকে সরাসরি <strong>SSLCommerz-এর অফিসিয়াল সুরক্ষিত পেমেন্ট পেজে</strong> রিডাইরেক্ট করা হবে। সেখানে আপনার পছন্দের কার্ড, মোবাইল ব্যাংকিং বা নেট ব্যাংকিং দিয়ে নিরাপদে পেমেন্ট সম্পন্ন করতে পারবেন।
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold">
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">💳 ভিসা / মাস্টারকার্ড</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">📱 বিকাশ / নগদ / রকেট</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">🏛️ ইন্টারনেট ব্যাংকিং</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">০% ইএমআই সুবিধা</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 4. UddoktaPay Automated Gateway Details */}
                                            {selectedGateway.code === 'uddoktapay' && (
                                                <div className="space-y-4">
                                                    <div className="bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0c4a6e] text-white p-5 rounded-3xl shadow-md border border-sky-400/40 space-y-4">
                                                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-black text-xs text-[#0284c7] shadow-md">
                                                                    UP
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-sm sm:text-base text-white">
                                                                        UddoktaPay অটোমেটেড পেমেন্ট গেটওয়ে
                                                                    </h4>
                                                                    <p className="text-[10px] text-sky-100">
                                                                        বিকাশ, নগদ, রকেট ও কার্ড দিয়ে সহজ পেমেন্ট
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                                                                ইনস্ট্যান্ট ভেরিফিকেশন ⚡
                                                            </span>
                                                        </div>

                                                        <div className="text-xs text-sky-50/90 leading-relaxed">
                                                            অর্ডার কনফার্ম করার পর আপনাকে সুরক্ষিত <strong>UddoktaPay পেমেন্ট পেজে</strong> রিডাইরেক্ট করা হবে। সেখানে সরাসরি বিকাশ, নগদ, রকেট বা কার্ড সিলেক্ট করে পেমেন্ট সম্পন্ন করতে পারবেন।
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold">
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">📱 বিকাশ পেমেন্ট</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">📱 নগদ পেমেন্ট</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">📱 রকেট পেমেন্ট</div>
                                                            <div className="bg-white/10 p-2 rounded-xl text-center border border-white/10">💳 ভিসা / মাস্টারকার্ড</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* 5. Indian UPI Automated & Dynamic QR Gateway Details */}
                                            {selectedGateway.code === 'upi_india' && (() => {
                                                const upiId = selectedGateway.account_number || settings?.indiaUpiId || 'guruzbd@upi';
                                                const inrTotal = Number(convertPrice(finalTotal)).toFixed(2);
                                                const upiPayUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Guruz&am=${inrTotal}&cu=INR&tn=Order`;
                                                
                                                return (
                                                    <div className="space-y-4">
                                                        <div className="bg-gradient-to-br from-[#0b3d1f] via-[#072412] to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-emerald-500/40 shadow-xl space-y-5">
                                                            {/* Header Banner */}
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#097939] via-[#000000] to-[#F47920] flex items-center justify-center font-black text-white text-sm shadow-md border border-white/20">
                                                                        UPI
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-black text-white text-base sm:text-lg">
                                                                                Instant UPI Payment (India 🇮🇳)
                                                                            </h4>
                                                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-400/30">
                                                                                0% Transaction Fee
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-emerald-200/80 font-medium">
                                                                            PhonePe • Google Pay • Paytm • BHIM • Cred • Any UPI App
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-400/20 rounded-full text-emerald-300 text-xs font-black self-start sm:self-auto">
                                                                    <Zap size={13} className="animate-pulse text-amber-400" />
                                                                    <span>ইনস্ট্যান্ট কিউআর পেমেন্ট</span>
                                                                </div>
                                                            </div>

                                                            {/* Amount to Pay Highlight */}
                                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                                <div>
                                                                    <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                                                                        সর্বমোট প্রদেয় মূল্য (INR):
                                                                    </p>
                                                                    <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-0.5">
                                                                        ₹ {inrTotal} INR
                                                                    </p>
                                                                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                                                                        (বিনিময় হার: 1 BDT ≈ ₹{rate || 0.72} INR • মূল দাম: ৳{finalTotal.toLocaleString()} BDT)
                                                                    </p>
                                                                </div>

                                                                {/* Copy UPI ID */}
                                                                <div className="flex flex-col gap-1 w-full sm:w-auto">
                                                                    <span className="text-[11px] text-slate-300 font-bold">মার্চেন্ট UPI ID:</span>
                                                                    <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                                                                        <span className="font-mono font-bold text-xs text-emerald-300">{upiId}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleCopy(upiId)}
                                                                            className="p-1 hover:text-emerald-400 text-slate-300 transition"
                                                                            title="Copy UPI ID"
                                                                        >
                                                                            {copiedText === upiId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* QR Code + Mobile Pay Button */}
                                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-col md:flex-row items-center gap-6">
                                                                <div className="relative group shrink-0">
                                                                    <div className="w-48 h-48 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center border-4 border-emerald-400/80">
                                                                        <QRCodeSVG
                                                                            value={upiPayUrl}
                                                                            size={164}
                                                                            level="H"
                                                                            includeMargin={false}
                                                                        />
                                                                    </div>
                                                                    <div className="text-center mt-2">
                                                                        <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30 shadow-xs">
                                                                            📷 যেকোনো UPI অ্যাপ দিয়ে স্ক্যান করুন
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex-1 space-y-3 text-center md:text-left">
                                                                    <h4 className="text-sm sm:text-base font-black text-white">
                                                                        মোবাইল থেকে সরাসরি এক ক্লিকে পে করুন:
                                                                    </h4>
                                                                    <p className="text-xs text-emerald-100/85 leading-relaxed">
                                                                        আপনি যদি মোবাইল থেকে অর্ডার করেন, নিচের বাটনে ক্লিক করলেই সরাসরি আপনার ডিভাইসের <strong>PhonePe, Google Pay, Paytm বা BHIM</strong> ওপেন হবে এবং সঠিক ₹{inrTotal} INR পেমেন্ট রিকোয়েস্ট তৈরি হবে।
                                                                    </p>

                                                                    <a
                                                                        href={upiPayUrl}
                                                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-lg transition shadow-emerald-500/20"
                                                                    >
                                                                        <ExternalLink size={16} />
                                                                        <span>UPI অ্যাপে পে করুন (Open UPI App)</span>
                                                                    </a>
                                                                </div>
                                                            </div>

                                                            {/* UPI Verification Inputs */}
                                                            <div className="bg-white/5 border border-white/15 rounded-2xl p-4 space-y-3">
                                                                <h5 className="text-xs font-black text-emerald-200 uppercase tracking-wider">
                                                                    পেমেন্ট সম্পন্ন করার পর নিচের তথ্য প্রদান করুন:
                                                                </h5>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    <div>
                                                                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                                                                            UPI রেফারেন্স / UTR নম্বর (12-Digit UTR) <span className="text-red-400">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            id="input-payment-trx-id"
                                                                            value={data.payment_trx_id}
                                                                            onChange={e => {
                                                                                setData('payment_trx_id', e.target.value);
                                                                                clearFieldError('payment_trx_id');
                                                                            }}
                                                                            placeholder="যেমন: 423589123456"
                                                                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-500"
                                                                        />
                                                                        {clientErrors.payment_trx_id && (
                                                                            <p className="text-[11px] text-rose-400 font-bold mt-1">{clientErrors.payment_trx_id}</p>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                                                                            আপনার UPI আইডি বা মোবাইল নম্বর <span className="text-red-400">*</span>
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            id="input-payment-sender-number"
                                                                            value={data.payment_sender_number}
                                                                            onChange={e => {
                                                                                setData('payment_sender_number', e.target.value);
                                                                                clearFieldError('payment_sender_number');
                                                                            }}
                                                                            placeholder="যেমন: yourname@okaxis বা 9876543210"
                                                                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-500"
                                                                        />
                                                                        {clientErrors.payment_sender_number && (
                                                                            <p className="text-[11px] text-rose-400 font-bold mt-1">{clientErrors.payment_sender_number}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}

                                    {/* Cash on delivery notice */}
                                    {selectedGateway?.code === 'cod' && (
                                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-bold">
                                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <span>ক্যাশ অন ডেলিভারি: পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে সম্পূর্ণ মূল্য পরিশোধ করুন।</span>
                                        </div>
                                    )}
                                </div>

                                {/* ─── WALLET BALANCE DISCOUNT CARD (Available on All Orders with Balance) ─── */}
                                {walletBalance > 0 && (
                                    <div 
                                        className={`border-2 rounded-3xl p-5 sm:p-6 shadow-sm transition-all duration-300 ${
                                            data.use_wallet 
                                                ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border-emerald-400 shadow-emerald-500/10 ring-4 ring-emerald-500/10' 
                                                : 'bg-white hover:border-slate-300 border-slate-200'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            {/* Left side: Icon & Info */}
                                            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md shrink-0 transition-all duration-300 ${
                                                    data.use_wallet 
                                                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-600/30 scale-105' 
                                                        : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {symbol}
                                                </div>

                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                                            Guruz Wallet ব্যালেন্স ব্যবহার করুন
                                                        </h4>
                                                        <span className="text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                                            বোনাস ক্যাশব্যাক
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        আপনার ওয়ালেট ব্যালেন্স: <strong className="text-slate-900 font-black">{formatPrice(walletBalance)}</strong> • <span className="text-emerald-700 font-bold">এই অর্ডারে ফিক্সড {formatPrice(perOrderWalletDiscount)} ওয়ালেট বোনাস ছাড় পাবেন</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right side: Modern Switch Button */}
                                            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                                <span className={`text-xs font-black transition-colors ${
                                                    data.use_wallet ? 'text-emerald-700' : 'text-slate-400'
                                                }`}>
                                                    {data.use_wallet ? `${formatPrice(perOrderWalletDiscount)} ছাড় সক্রিয়` : 'ওয়ালেট ছাড় বন্ধ'}
                                                </span>

                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={data.use_wallet}
                                                    onClick={() => setData('use_wallet', !data.use_wallet)}
                                                    className={`relative inline-flex h-8 w-15 shrink-0 cursor-pointer rounded-full p-1 transition-all duration-300 ease-in-out focus:outline-none shadow-inner ${
                                                        data.use_wallet 
                                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-600/40 ring-2 ring-emerald-400/50' 
                                                            : 'bg-slate-200 hover:bg-slate-300'
                                                    }`}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-all duration-300 ease-spring flex items-center justify-center font-bold text-xs ${
                                                            data.use_wallet 
                                                                ? 'translate-x-7 text-emerald-600' 
                                                                : 'translate-x-0 text-slate-300'
                                                        }`}
                                                    >
                                                        {data.use_wallet ? (
                                                            <Check size={14} className="stroke-[3]" />
                                                        ) : (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                        )}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Notice banner when switch is ON */}
                                        {data.use_wallet && (
                                            <div className="mt-4 pt-3.5 border-t border-emerald-200/60 flex items-center justify-between gap-3 animate-in fade-in-50 duration-200">
                                                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                                    <Check size={15} className="text-emerald-600 shrink-0" />
                                                    এই অর্ডারে আপনার Guruz ওয়ালেট ব্যালেন্স থেকে <strong>{formatPrice(perOrderWalletDiscount)}</strong> বোনাস ছাড় সফলভাবে প্রয়োগ করা হয়েছে।
                                                </span>
                                                <span className="text-xs font-black text-emerald-700 bg-emerald-100/90 px-3 py-1.5 rounded-xl shrink-0 shadow-2xs">
                                                    - {formatPrice(perOrderWalletDiscount)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ─── ORDER NOTES ─── */}
                                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-2">
                                    <label className="block text-xs font-black text-slate-700">
                                        অর্ডার নোট / বিশেষ নির্দেশনা (Optional)
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        placeholder="ডেলিভারি সম্পর্কে কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 resize-none transition"
                                    />
                                </div>
                            </div>

                            {/* Right: Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm sticky top-24 space-y-5">
                                    <h3 className="font-black text-lg text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                                        <span>Order Summary</span>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{items.length} Items</span>
                                    </h3>

                                    {/* Items List */}
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                        {items.map(item => (
                                            <div key={item.product_id} className="flex items-center gap-3 text-sm">
                                                <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-lg">🛍️</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">{item.name}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium">পরিমাণ: {item.quantity}</p>
                                                </div>
                                                <span className="font-black text-slate-900 shrink-0 text-xs sm:text-sm">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs sm:text-sm font-medium">
                                        <div className="flex justify-between text-slate-600">
                                            <span>পণ্যের মূল্য (Subtotal):</span>
                                            <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                                        </div>
                                        {/* Delivery Charge & Zone Selection (ঢাকার ভিতরে / ঢাকার বাইরে) */}
                                        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/90 space-y-2">
                                            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                                <span className="flex items-center gap-1.5">
                                                    <Truck size={14} className="text-emerald-600" /> ডেলিভারি চার্জ:
                                                </span>
                                                <span className="text-emerald-600 font-black text-sm">
                                                    {isFreeShipping ? (
                                                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                                                            ফ্রি ডেলিভারি 🎉
                                                        </span>
                                                    ) : (
                                                        formatPrice(shippingFee)
                                                    )}
                                                </span>
                                            </div>

                                            {/* Two Interactive Options: ঢাকার ভিতরে & ঢাকার বাইরে */}
                                            <div className="grid grid-cols-2 gap-2 pt-0.5">
                                                {availableDeliveryCharges.map((dc) => {
                                                    const isSelected = selectedDeliveryZone === dc.code;
                                                    return (
                                                        <button
                                                            key={dc.code}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedDeliveryZone(dc.code);
                                                                setData('delivery_zone', dc.code);
                                                                if (dc.code === 'inside_dhaka' && (!data.city || data.city === 'Outside Dhaka')) {
                                                                    setData('city', 'Dhaka');
                                                                }
                                                            }}
                                                            className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between select-none ${
                                                                isSelected
                                                                    ? 'border-emerald-500 bg-white shadow-xs ring-2 ring-emerald-500/20'
                                                                    : 'border-slate-200 hover:border-slate-300 bg-white/70 hover:bg-white'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-1.5 mb-1">
                                                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                                    isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                                                                }`}>
                                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <span className={`text-xs leading-tight font-bold truncate ${
                                                                    isSelected ? 'text-emerald-950 font-black' : 'text-slate-700'
                                                                }`}>
                                                                    {dc.title}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between pl-5">
                                                                <span className="text-[10px] text-slate-400 font-medium">
                                                                    {dc.estimated_days || (dc.code === 'inside_dhaka' ? '২-৩ দিন' : '৩-৫ দিন')}
                                                                </span>
                                                                <span className={`text-xs font-black ${
                                                                    isSelected ? 'text-emerald-600' : 'text-slate-600'
                                                                }`}>
                                                                    {isFreeShipping ? 'ফ্রি' : formatPrice(dc.charge)}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {couponDiscount > 0 && (
                                            <div className="flex justify-between text-rose-600 font-bold">
                                                <span>কুপন ছাড় (Coupon):</span>
                                                <span>- {formatPrice(couponDiscount)}</span>
                                            </div>
                                        )}
                                        {walletDiscount > 0 && (
                                            <div className="flex justify-between text-emerald-600 font-bold">
                                                <span>ওয়ালেট ব্যালেন্স ছাড়:</span>
                                                <span>- {formatPrice(walletDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-base text-slate-900">
                                            <span>সর্বমোট মূল্য:</span>
                                            <span className="text-emerald-600 text-lg sm:text-xl">{formatPrice(finalTotal)}</span>
                                        </div>
                                    </div>

                                    {/* Manual Coupon Code Input */}
                                    {isCouponSystemEnabled && (
                                        <div className="border-t border-slate-100 pt-4 space-y-3">
                                            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                                <Tag size={13} className="text-amber-500" />
                                                <span>কুপন কোড লিখুন (Optional)</span>
                                            </h4>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="কুপন কোড লিখুন..."
                                                    value={manualCouponInput}
                                                    onChange={(e) => {
                                                        setManualCouponInput(e.target.value.toUpperCase());
                                                        setCouponMessage(null);
                                                    }}
                                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={!manualCouponInput.trim() || couponApplying}
                                                    onClick={() => {
                                                        const code = manualCouponInput.trim();
                                                        if (!code) return;

                                                        setCouponApplying(true);
                                                        setCouponMessage(null);

                                                        // Check if the code exists in availableOffers
                                                        const matchedOffer = availableOffers?.find((o: any) => o.promo_code === code);
                                                        
                                                        if (matchedOffer) {
                                                            setData('coupon_code', code);
                                                            setCouponMessage({ type: 'success', text: `✅ কুপন "${code}" সফলভাবে প্রয়োগ হয়েছে!` });
                                                            setCouponApplying(false);
                                                        } else {
                                                            // Try to validate via API for unlisted/private coupons
                                                            fetch('/api/coupons/validate', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' },
                                                                body: JSON.stringify({ code, subtotal }),
                                                            })
                                                                .then(res => res.json())
                                                                .then(result => {
                                                                    if (result.valid) {
                                                                        setData('coupon_code', code);
                                                                        setCouponMessage({ type: 'success', text: `✅ কুপন "${code}" সফলভাবে প্রয়োগ হয়েছে! ছাড়: ৳${result.discount}` });
                                                                    } else {
                                                                        setCouponMessage({ type: 'error', text: result.message || '❌ এই কুপন কোডটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে।' });
                                                                    }
                                                                })
                                                                .catch(() => {
                                                                    // If API not available, just try setting the code (backend will validate on submit)
                                                                    setData('coupon_code', code);
                                                                    setCouponMessage({ type: 'success', text: `✅ কুপন "${code}" যোগ করা হয়েছে। অর্ডার নিশ্চিত করলে ভ্যালিডেট হবে।` });
                                                                })
                                                                .finally(() => setCouponApplying(false));
                                                        }
                                                    }}
                                                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                                >
                                                    {couponApplying ? 'চেক হচ্ছে...' : 'Apply'}
                                                </button>
                                            </div>

                                            {/* Coupon validation message */}
                                            {couponMessage && (
                                                <div className={`text-xs font-bold px-3 py-2 rounded-xl ${couponMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                                    {couponMessage.text}
                                                </div>
                                            )}

                                            {/* Applied coupon - remove button */}
                                            {data.coupon_code && (
                                                <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-2xl px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-emerald-600 text-xs">🎟️</span>
                                                        <span className="font-black text-xs text-emerald-700">{data.coupon_code}</span>
                                                        {couponDiscount > 0 && (
                                                            <span className="text-[10px] font-bold text-emerald-600">(-{formatPrice(couponDiscount)})</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData('coupon_code', '');
                                                            setManualCouponInput('');
                                                            setCouponMessage(null);
                                                        }}
                                                        className="text-red-500 hover:text-red-700 text-[10px] font-black cursor-pointer"
                                                    >
                                                        ✕ সরান
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}




                                    {/* Submit Order Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
                                    >
                                        {processing ? 'অর্ডার কনফার্ম হচ্ছে...' : (
                                            <>
                                                <span>অর্ডার নিশ্চিত করুন • {formatPrice(finalTotal)}</span>
                                                <ChevronRight size={18} />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[11px] text-slate-400 text-center font-medium flex items-center justify-center gap-1.5">
                                        <ShieldCheck size={14} className="text-emerald-600" />
                                        <span>১০০% নিরাপদ এবং এনক্রিপ্টেড চেকআউট</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </main>
            </div>

            <Footer />
        </div>
    );
}
