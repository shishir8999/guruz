import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { Check, Wallet, Package, Truck, Home, ShoppingBag, MapPin } from 'lucide-react';
import { useWindowSize } from 'react-use';

interface OrderConfirmationProps {
    order: any;
}

interface TrailPoint {
    x: number;
    y: number;
}

class SparkParticle {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    vx: number;
    vy: number;
    color: string;
    alpha: number;
    decay: number;
    gravity: number;
    drag: number;
    size: number;
    flicker: boolean;

    constructor(
        x: number,
        y: number,
        color: string,
        angle: number,
        speed: number,
        gravity = 0.11,
        drag = 0.945,
        size = 2.4
    ) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.016;
        this.gravity = gravity;
        this.drag = drag;
        this.size = size;
        this.flicker = Math.random() > 0.3;
    }

    update(): boolean {
        this.prevX = this.x;
        this.prevY = this.y;

        this.vx *= this.drag;
        this.vy *= this.drag;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.alpha <= 0) return;

        const a = this.flicker ? this.alpha * (0.7 + Math.random() * 0.3) : this.alpha;
        ctx.globalAlpha = Math.max(0, Math.min(1, a));

        // 1. Burning fire streak
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 2. White-hot center spark
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
    }
}

class Rocket {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    targetY: number;
    vx: number;
    vy: number;
    burstType: 'gold_brocade' | 'diwali_color' | 'willow' | 'crackle_palm';
    exploded: boolean;

    constructor(w: number, h: number, targetX?: number, targetY?: number) {
        this.x = typeof targetX === 'number' ? targetX : Math.random() * (w * 0.74) + w * 0.13;
        this.y = h + 10;
        this.prevX = this.x;
        this.prevY = this.y;
        this.targetY = typeof targetY === 'number' ? targetY : Math.random() * (h * 0.45) + h * 0.1;

        const dx = (typeof targetX === 'number' ? targetX : this.x + (Math.random() - 0.5) * 70) - this.x;
        const totalDist = h - this.targetY;
        // High launch velocity for fast rocket ascent!
        const speed = Math.random() * 8 + 24;
        const duration = totalDist / speed;

        this.vx = dx / Math.max(1, duration);
        this.vy = -speed;
        this.exploded = false;

        const types: ('gold_brocade' | 'diwali_color' | 'willow' | 'crackle_palm')[] = [
            'gold_brocade',
            'gold_brocade',
            'diwali_color',
            'willow',
            'crackle_palm',
        ];
        this.burstType = types[Math.floor(Math.random() * types.length)];
    }

    update(sparks: SparkParticle[]): boolean {
        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.12;

        // Rapid exhaust sparks trailing behind rocket
        sparks.push(
            new SparkParticle(
                this.x + (Math.random() - 0.5) * 3,
                this.y + 3,
                Math.random() > 0.4 ? '#ffd700' : '#ff4500',
                Math.PI / 2 + (Math.random() - 0.5) * 0.4,
                Math.random() * 4 + 2,
                0.2,
                0.9,
                2
            )
        );

        if (this.y <= this.targetY || this.vy >= -2) {
            this.exploded = true;
            return false;
        }
        return true;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = 1;

        // Bright flame head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Rapid flame trail
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = '#ff9900';
        ctx.lineWidth = 3.5;
        ctx.stroke();
    }
}

const triggerExplosion = (
    rocket: Rocket,
    sparks: SparkParticle[],
    triggerFlash: () => void
) => {
    triggerFlash();

    const count = Math.floor(Math.random() * 30 + 85);
    const goldPalette = ['#ffd700', '#ffec8b', '#ffaa00', '#ff5500', '#ffffff'];
    const vibrantPalettes = [
        ['#ff1144', '#ff4477', '#ffaacc', '#ffffff'],
        ['#ff7700', '#ffbb00', '#ffff33', '#ffffff'],
        ['#00ff66', '#33ffaa', '#aaffdd', '#ffffff'],
        ['#00ddff', '#55eeff', '#bbeeef', '#ffffff'],
        ['#ee00ff', '#ff55ff', '#ffaaff', '#ffffff'],
    ];
    const vibrantColors = vibrantPalettes[Math.floor(Math.random() * vibrantPalettes.length)];

    const isWillow = rocket.burstType === 'willow';
    const isColor = rocket.burstType === 'diwali_color';

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Explosive initial speed!
        const speed = isWillow
            ? Math.random() * 6.5 + 2
            : Math.random() * 10 + 4;

        const color = isColor
            ? vibrantColors[Math.floor(Math.random() * vibrantColors.length)]
            : goldPalette[Math.floor(Math.random() * goldPalette.length)];

        const gravity = isWillow ? 0.07 : 0.11;
        const drag = isWillow ? 0.965 : 0.945;
        const p = new SparkParticle(rocket.x, rocket.y, color, angle, speed, gravity, drag, 2.4);
        if (isWillow) {
            p.decay = Math.random() * 0.01 + 0.009;
        }
        sparks.push(p);
    }
};

// Fast Tubri / Anar fountain sparks from bottom corners
const sprayAnar = (x: number, y: number, sparks: SparkParticle[]) => {
    const goldPalette = ['#ffd700', '#ffec8b', '#ffaa00', '#ff4500', '#ffffff'];
    for (let i = 0; i < 6; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
        const speed = Math.random() * 10 + 7;
        const color = goldPalette[Math.floor(Math.random() * goldPalette.length)];
        const p = new SparkParticle(x, y, color, angle, speed, 0.2, 0.93, 2.2);
        p.decay = Math.random() * 0.03 + 0.022;
        sparks.push(p);
    }
};

interface DiwaliFireworksProps {
    duration?: number;
}

const DiwaliFireworks: React.FC<DiwaliFireworksProps> = ({ duration = 20000 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(true);

    useEffect(() => {
        // Fade out smoothly at duration (20 seconds)
        const fadeTimer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        // Completely unmount canvas shortly after fade completes
        const unmountTimer = setTimeout(() => {
            setIsMounted(false);
        }, duration + 1500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(unmountTimer);
        };
    }, [duration]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        const startTime = Date.now();

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        const rockets: Rocket[] = [];
        const sparks: SparkParticle[] = [];
        let flashAlpha = 0;

        const triggerFlash = () => {
            if (Date.now() - startTime < duration) {
                flashAlpha = 0.22;
            }
        };

        const launchRocket = (targetX?: number, targetY?: number) => {
            rockets.push(new Rocket(width, height, targetX, targetY));
        };

        // Rapid initial fireworks volley!
        launchRocket(width * 0.25, height * 0.22);
        launchRocket(width * 0.75, height * 0.24);
        setTimeout(() => {
            if (Date.now() - startTime < duration) {
                launchRocket(width * 0.5, height * 0.18);
            }
        }, 200);

        // Fast launch timer (every 220-450ms for energetic non-stop festival fireworks)
        let lastLaunch = Date.now();
        let nextInterval = 300;
        let lastAnar = Date.now();

        // Click anywhere to burst instant rockets while active
        const handleClick = (e: MouseEvent) => {
            if (Date.now() - startTime < duration) {
                launchRocket(e.clientX, e.clientY);
            }
        };
        window.addEventListener('click', handleClick);

        const render = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const isSpawning = elapsed < duration;

            // Fast clear canvas
            ctx.clearRect(0, 0, width, height);

            // Explosive sky flash
            if (flashAlpha > 0) {
                ctx.save();
                ctx.fillStyle = `rgba(255, 230, 180, ${flashAlpha})`;
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
                flashAlpha -= 0.03;
            }

            // High performance glowing fire mode
            ctx.globalCompositeOperation = 'lighter';

            // Only launch new rockets & anar fountains during the active duration (20s)
            if (isSpawning) {
                if (now - lastLaunch > nextInterval) {
                    lastLaunch = now;
                    nextInterval = Math.random() * 260 + 200; // launches every 200-460ms!
                    launchRocket();

                    // Occasional double firework
                    if (Math.random() > 0.4) {
                        setTimeout(() => {
                            if (Date.now() - startTime < duration) {
                                launchRocket();
                            }
                        }, 100);
                    }
                }

                // Fountain spray from bottom corners
                if (now - lastAnar > 60) {
                    lastAnar = now;
                    sprayAnar(width * 0.05, height, sparks);
                    sprayAnar(width * 0.95, height, sparks);
                }
            }

            // Update & draw rockets
            for (let i = rockets.length - 1; i >= 0; i--) {
                const rocket = rockets[i];
                if (!rocket.update(sparks)) {
                    if (rocket.exploded) {
                        triggerExplosion(rocket, sparks, triggerFlash);
                    }
                    rockets.splice(i, 1);
                } else {
                    rocket.draw(ctx);
                }
            }

            // Update & draw sparks
            for (let i = sparks.length - 1; i >= 0; i--) {
                const spark = sparks[i];
                if (!spark.update()) {
                    sparks.splice(i, 1);
                } else {
                    spark.draw(ctx);
                }
            }

            // Reset composite operation
            ctx.globalCompositeOperation = 'source-over';

            // When duration is over and all existing rockets and sparks are gone, cleanly finish
            if (!isSpawning && rockets.length === 0 && sparks.length === 0) {
                ctx.clearRect(0, 0, width, height);
                return; // Stop animation loop
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', handleClick);
        };
    }, [duration]);

    if (!isMounted) return null;

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-30 w-full h-full transition-opacity duration-1000 ${
                isVisible ? 'opacity-100' : 'opacity-0'
            }`}
        />
    );
};

export default function OrderConfirmation({ order }: OrderConfirmationProps) {
    const { width, height } = useWindowSize();
    const [isCelebrationActive, setIsCelebrationActive] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsCelebrationActive(false);
        }, 20000); // 20 seconds
        return () => clearTimeout(timer);
    }, []);

    // Basic calculations
    const itemsSum = (order.items && order.items.length > 0)
        ? order.items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0)
        : (Number(order.subtotal) || Number(order.total) || 0);

    const subtotal = Number(order.subtotal) > 0 ? Number(order.subtotal) : itemsSum;
    const discount = Number(order.discount) || 0;
    const couponCode = order.coupon_code;
    const shippingCost = Number(order.shipping_fee ?? 60);
    const grandTotal = Number(order.total) || Math.max(0, subtotal - discount + shippingCost);
    const currencySymbol = order.currency === 'INR' ? '₹' : (order.currency === 'USD' ? '$' : '৳');
    const cashback = 200; // Hardcoded fallback

    return (
        <div className="min-h-screen flex flex-col relative bg-slate-900 overflow-hidden">
            {/* Colorful Animated Background (Slows / softens after 20s celebration) */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isCelebrationActive ? 'opacity-40' : 'opacity-20'}`}>
                <div className={`absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 rounded-full mix-blend-screen filter blur-[100px] ${isCelebrationActive ? 'animate-[spin_8s_linear_infinite]' : ''}`}></div>
                <div className={`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-r from-lime-400 via-emerald-500 to-cyan-500 rounded-full mix-blend-screen filter blur-[120px] ${isCelebrationActive ? 'animate-[spin_10s_linear_infinite_reverse]' : ''}`}></div>
                <div className={`absolute top-[20%] left-[30%] w-[50vw] h-[50vw] bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-full mix-blend-screen filter blur-[110px] ${isCelebrationActive ? 'animate-[spin_12s_linear_infinite]' : ''}`}></div>
            </div>

            {/* Real Diwali Fireworks Simulation (Runs for 20s, then automatically stops) */}
            <DiwaliFireworks duration={20000} />

            <Head title={`Order ${order.order_number} Confirmed — Guruz`} />
            
            {/* The header is usually white, ensure it sits above the background */}
            <div className="relative z-10 bg-white">
                <Header />
            </div>

            <main className="flex-1 relative z-10 container mx-auto px-4 py-8 sm:py-10 max-w-2xl space-y-4 sm:space-y-6">
                
                {/* 1. Main Confirmation Card (Rainbow Glowing) */}
                <div className="relative rounded-[1.5rem] sm:rounded-[2rem] p-[3px] sm:p-[4px] overflow-hidden shadow-[0_10px_50px_-10px_rgba(236,72,153,0.6)] group mx-auto">
                    {/* Animated Rainbow Border */}
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,#ff0000,#ff8000,#ffff00,#00ff00,#00ffff,#0000ff,#8000ff,#ff00ff,#ff0000)] bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]"></div>
                    
                    <div className="relative bg-white/95 backdrop-blur-3xl p-6 sm:p-8 rounded-[1.4rem] sm:rounded-[1.8rem] text-center space-y-4 sm:space-y-6">
                        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.8)] animate-[bounce_2s_infinite]">
                            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-40"></div>
                            <Check className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[4]" />
                        </div>

                        <div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <span className="text-pink-600 text-xs sm:text-sm font-bold bg-pink-100 px-3 py-1 rounded-full animate-pulse">🎉 অভিনন্দন 🎉</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black bg-[linear-gradient(to_right,#ef4444,#eab308,#22c55e,#3b82f6,#a855f7)] text-transparent bg-clip-text mb-2 sm:mb-3 animate-[gradient_4s_linear_infinite] bg-[length:200%_auto]">
                                ধন্যবাদ!
                            </h1>
                            <p className="text-slate-800 font-extrabold text-lg sm:text-xl mb-1">
                                আপনার অর্ডার নিশ্চিত হয়েছে 🛒
                            </p>
                            <p className="text-sm sm:text-base text-slate-600 font-medium">
                                আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                            </p>
                        </div>

                        <div className="inline-block mt-3 sm:mt-4 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-extrabold text-base sm:text-lg shadow-[0_0_20px_rgba(217,70,239,0.6)] transition-transform hover:scale-110 cursor-default">
                            অর্ডার নং: {order.order_number}
                        </div>
                    </div>
                </div>

                {/* 2. Order Success Banner */}
                <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 rounded-2xl p-[3px] sm:p-1 shadow-[0_10px_30px_rgba(16,185,129,0.4)] relative overflow-hidden group hover:scale-[1.01] transition-transform">
                    <div className="bg-white/95 backdrop-blur-3xl rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 relative overflow-hidden">
                        {/* Shine sweeping effect */}
                        <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 group-hover:animate-[shimmer_1s_infinite]"></div>
                        
                        <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
                            <Truck className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <div className="text-emerald-700 text-xs sm:text-sm font-black mb-1 uppercase tracking-wider flex items-center gap-1">
                                <span className="text-base">📦</span> দ্রুত ডেলিভারি প্রসেসিং
                            </div>
                            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base lg:text-lg">
                                আপনার অর্ডারটি দ্রুততম সময়ে ডেলিভারির জন্য প্রস্তুত করা হচ্ছে!
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-semibold leading-tight">
                                অর্ডারের অগ্রগতি লাইভ দেখতে আপনি যেকোনো সময় ট্র্যাক করতে পারেন।
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Items Summary */}
                <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <div className="bg-purple-600 p-1.5 rounded-lg">
                            <Package className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">আইটেম</h3>
                    </div>

                    <div className="space-y-3 pb-3 border-b border-slate-100 border-dashed">
                        {order.items && order.items.length > 0 ? (
                            order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-start text-sm">
                                    <span className="text-slate-600 font-medium pr-4">
                                        {item.product_name} <span className="text-purple-600 font-bold">× {item.quantity}</span>
                                    </span>
                                    <span className="font-bold text-slate-800 whitespace-nowrap">
                                        ৳ {(item.price * item.quantity).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-slate-500 text-center italic py-2">
                                (Items not loaded properly)
                            </div>
                        )}
                    </div>

                    <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>পণ্যের মোট দাম (Subtotal)</span>
                            <span className="font-bold text-slate-900">{currencySymbol} {Number(subtotal).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                        </div>

                        {discount > 0 && (
                            <div className="flex justify-between items-center text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-3 py-2 rounded-xl text-xs sm:text-sm font-black shadow-2xs">
                                <span className="flex items-center gap-1.5">
                                    <span className="text-base">🎟️</span>
                                    <span>
                                        কুপন ছাড় (Discount)
                                        {couponCode ? <span className="ml-1.5 px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-md text-[11px] font-mono tracking-wide">{couponCode}</span> : null}
                                    </span>
                                </span>
                                <span className="text-emerald-700 font-black text-sm">
                                    - {currencySymbol} {Number(discount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between text-slate-600 pb-3 border-b border-slate-100 border-dashed">
                            <span>ডেলিভারি চার্জ (Delivery Charge)</span>
                            <span className="font-semibold text-slate-900">
                                {shippingCost === 0 ? (
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">ফ্রি (Free)</span>
                                ) : (
                                    `${currencySymbol} ${Number(shippingCost).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                            <span className="font-extrabold text-slate-800">সর্বমোট (Total Amount)</span>
                            <span className="font-black text-xl text-purple-700">
                                {currencySymbol} {Number(grandTotal).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Shipping Info */}
                <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Truck className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">শিপিং তথ্য</h3>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <p className="font-bold text-slate-800 text-sm">{order.customer_name} • {order.customer_phone}</p>
                            <div className="flex items-start gap-1.5 mt-1.5">
                                <MapPin className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-600">{order.shipping_address}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <span className="bg-amber-100 text-amber-700 font-bold text-xs px-3 py-1 rounded-full shadow-sm">COD</span>
                            <span className="bg-emerald-100 text-emerald-700 font-bold text-xs px-3 py-1 rounded-full shadow-sm capitalize">{order.status || 'Pending'}</span>
                        </div>
                    </div>
                </div>

                {/* 5. Action Buttons Row */}
                <div className="grid grid-cols-3 gap-3">
                    <Link href={`/track?search=${order.order_number}`} className="col-span-1">
                        <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-1 transition-colors group">
                            <Truck className="w-5 h-5 text-teal-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs">ট্র্যাক</span>
                        </button>
                    </Link>
                    <Link href="/" className="col-span-1">
                        <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-1 transition-colors group">
                            <Home className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                            <span className="text-xs">হোম</span>
                        </button>
                    </Link>
                    <Link href="/" className="col-span-1">
                        <button className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-purple-500/30 flex flex-col items-center justify-center gap-1 transition-all group">
                            <ShoppingBag className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            <span className="text-xs">আরও কিনুন</span>
                        </button>
                    </Link>
                </div>

            </main>

            <div className="relative z-10 bg-[#111111]">
                <Footer />
            </div>
        </div>
    );
}
