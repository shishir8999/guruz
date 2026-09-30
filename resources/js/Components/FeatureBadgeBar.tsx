const BADGES = [
    { icon: '🚚', label: 'Free Delivery', sub: 'Orders over ৳500', color: 'from-blue-500 to-blue-600' },
    { icon: '💳', label: 'Cash on Delivery', sub: 'Pay when received', color: 'from-emerald-500 to-teal-600' },
    { icon: '🔒', label: 'Secure Payment', sub: '100% protected', color: 'from-purple-500 to-purple-600' },
    { icon: '↩️', label: 'Easy Returns', sub: '7-day policy', color: 'from-orange-500 to-rose-500' },
    { icon: '⚡', label: 'Fast Shipping', sub: '1-3 business days', color: 'from-yellow-500 to-orange-500' },
    { icon: '🎁', label: 'Exclusive Deals', sub: 'Members only', color: 'from-pink-500 to-rose-600' },
];

export function FeatureBadgeBar() {
    return (
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
            <div className="flex gap-3 pb-1" style={{ minWidth: 'max-content' }}>
                {BADGES.map(b => (
                    <div
                        key={b.label}
                        className="flex items-center gap-2.5 shrink-0 px-4 py-2.5 rounded-xl bg-white border border-border shadow-sm hover:shadow-md transition cursor-default"
                    >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${b.color} flex items-center justify-center text-base shadow-inner`}>
                            {b.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground leading-none">{b.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{b.sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}