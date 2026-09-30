import { Head, Link, router } from '@inertiajs/react';
import { Header } from '@/Components/Header';
import { Footer } from '@/Components/Footer';
import { MobileBottomNav } from '@/Components/MobileBottomNav';
import { useCartStore } from '@/lib/cart';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function Cart() {
    const { items, remove, updateQty, clear } = useCartStore();
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const handleCheckout = () => {
        router.visit('/checkout');
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Head title="Cart — Guruz" />
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/products" className="text-muted-foreground hover:text-foreground transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                        Shopping Cart
                        {items.length > 0 && (
                            <span className="ml-1 text-base font-normal text-muted-foreground">
                                ({items.length} {items.length === 1 ? 'item' : 'items'})
                            </span>
                        )}
                    </h1>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-card border border-dashed rounded-2xl">
                        <div className="text-7xl mb-6">🛒</div>
                        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-6">Start shopping and add items to your cart</p>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-3">
                            {items.map(item => (
                                <div
                                    key={item.product_id}
                                    className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                                >
                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${item.slug}`}
                                            className="font-semibold text-sm sm:text-base truncate hover:text-primary transition block"
                                        >
                                            {item.name}
                                        </Link>
                                        <p className="text-emerald-600 font-bold mt-1">
                                            ৳{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">৳{item.price.toLocaleString()} each</p>
                                    </div>

                                    {/* Quantity */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => updateQty(item.product_id, item.quantity - 1)}
                                            className="w-7 h-7 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQty(item.product_id, item.quantity + 1)}
                                            className="w-7 h-7 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => remove(item.product_id)}
                                        className="shrink-0 p-2 text-muted-foreground hover:text-destructive transition rounded-lg hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={clear}
                                className="text-sm text-muted-foreground hover:text-destructive transition flex items-center gap-1"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Clear all items
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
                                <h3 className="font-bold text-lg mb-4 border-b border-border pb-3">Order Summary</h3>
                                <div className="space-y-2.5 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Product Price ({items.length} items)</span>
                                        <span>৳{total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivery Charge</span>
                                        <span className="text-emerald-600 font-medium">৳60</span>
                                    </div>
                                    <hr className="border-border" />
                                    <div className="flex justify-between font-bold text-base">
                                        <span>Total Amount</span>
                                        <span className="text-emerald-600">৳{(total + 60).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_6px_20px_-4px_rgba(16,185,129,0.7)]"
                                >
                                    Proceed to Checkout
                                </button>

                                <Link href="/products" className="block text-center mt-3 text-sm text-muted-foreground hover:text-foreground transition">
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
            <MobileBottomNav />
        </div>
    );
}
