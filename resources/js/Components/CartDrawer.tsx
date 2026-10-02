import { Link, router, usePage } from "@inertiajs/react";
import { ShoppingCart, Trash2, Minus, Plus, X, Home, LayoutGrid, Store, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/Components/ui/sheet";
import { useCartStore } from "@/lib/cart";
import { useI18nStore } from "@/lib/i18n";
import { useCurrencyStore } from "@/lib/currency";

export function CartDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t, lang } = useI18nStore();
  const { formatPrice } = useCurrencyStore();
  const { auth } = usePage<any>().props;
  const user = auth?.user ?? null;

  const items = useCartStore((s) => s.items);
  const remove = useCartStore((s) => s.remove);
  const updateQty = useCartStore((s) => s.updateQty);

  const subtotal = items.reduce((s, r) => s + r.price * r.quantity, 0);
  const totalCount = items.reduce((a, b) => a + b.quantity, 0);

  const navigateAndClose = (href: string) => {
    onOpenChange(false);
    router.visit(href, {
      preserveScroll: false,
      preserveState: false,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-[#0052cc] dark:bg-slate-950 text-white flex-row items-center justify-between space-y-0 shrink-0">
          <SheetTitle className="text-white flex items-center gap-2 text-base font-bold">
            <ShoppingCart className="w-5 h-5" />
            {t("cart") || "কার্ট"}
            <span className="text-xs opacity-80 font-normal">({totalCount})</span>
          </SheetTitle>
          <SheetClose className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </SheetClose>
        </SheetHeader>

        {/* Content Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <ShoppingCart className="w-14 h-14 text-slate-300 dark:text-slate-700" />
            <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {lang === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty"}
            </div>
            <button
              onClick={() => navigateAndClose('/products')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition cursor-pointer"
            >
              {lang === "bn" ? "শপিং চালিয়ে যান" : "Continue shopping"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
              {items.map((r) => (
                <div key={r.product_id} className="flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <Link
                    href={`/products/${r.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="w-16 h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-slate-400" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${r.slug}`} onClick={() => onOpenChange(false)} className="text-sm font-bold line-clamp-2 text-slate-700 dark:text-slate-200 hover:text-[#0052cc] dark:hover:text-blue-400 block">
                      {r.name}
                    </Link>
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 font-black mt-1">
                      {formatPrice(r.price)}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                        <button
                          onClick={() => updateQty(r.product_id, r.quantity - 1)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-bold min-w-[32px] text-center border-x border-slate-200 dark:border-slate-700">
                          {r.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(r.product_id, r.quantity + 1)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(r.product_id)}
                        className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-md transition"
                        aria-label="Remove"
                        title={lang === "bn" ? "রিমুভ" : "Remove"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50 dark:bg-[#0a1120] shrink-0">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{lang === "bn" ? "পণ্যের দাম" : "Product Price"}</span>
                <span className="font-black text-lg text-slate-800 dark:text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigateAndClose('/cart')}
                  className="text-center px-4 py-2.5 rounded-xl border-2 border-[#0052cc] text-[#0052cc] dark:border-blue-500 dark:text-blue-400 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                >
                  {lang === "bn" ? "কার্ট দেখুন" : "View Cart"}
                </button>
                <button
                  type="button"
                  onClick={() => navigateAndClose('/checkout')}
                  className="text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-[0_4px_14px_-4px_rgba(249,115,22,0.5)] hover:from-orange-400 hover:to-amber-400 transition cursor-pointer"
                >
                  {lang === "bn" ? "চেকআউট" : "Checkout"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* 📱 Persistent Mobile Bottom Navigation Bar Inside Drawer for 0-Friction Navigation */}
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-1 py-1 pb-[calc(0.3rem+env(safe-area-inset-bottom))] shadow-lg select-none shrink-0">
          <div className="flex items-center justify-around">
            <button
              type="button"
              onClick={() => navigateAndClose('/')}
              className="flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <div className="px-3.5 py-1 rounded-xl">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-semibold mt-0.5">{t('home') || 'হোম'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateAndClose('/products')}
              className="flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <div className="px-3.5 py-1 rounded-xl">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-semibold mt-0.5">{t('categories') || 'ক্যাটাগরি'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateAndClose('/shops')}
              className="flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <div className="px-3.5 py-1 rounded-xl">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-semibold mt-0.5">{t('shops') || 'শপ'}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer text-emerald-600 dark:text-emerald-400"
            >
              <div className="px-3.5 py-1 rounded-xl bg-emerald-600 text-white shadow-md relative">
                <ShoppingCart className="w-5 h-5 scale-105" />
                {totalCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-md border-2 border-white dark:border-slate-900 animate-pulse">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight font-black mt-0.5">{t('cart') || 'কার্ট'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigateAndClose(user ? '/account' : '/login')}
              className="flex-1 flex flex-col items-center justify-center py-1 group cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <div className="px-3.5 py-1 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight font-semibold mt-0.5">{user ? (t('profile') || 'প্রোফাইল') : (t('account') || 'অ্যাকাউন্ট')}</span>
            </button>
          </div>
        </div>

      </SheetContent>
    </Sheet>
  );
}