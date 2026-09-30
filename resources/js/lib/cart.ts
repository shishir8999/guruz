import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    product_id: string | number;
    slug: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string | null;
    shop_id?: string | number | null;
}

export interface CartPopupData {
    isOpen: boolean;
    productName?: string;
    productImage?: string | null;
    price?: number;
    quantity?: number;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    popup: CartPopupData;
    setIsOpen: (isOpen: boolean) => void;
    showPopup: (data: { productName: string; productImage?: string | null; price?: number; quantity?: number }) => void;
    hidePopup: () => void;
    add: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
    remove: (product_id: string | number) => void;
    updateQty: (product_id: string | number, quantity: number) => void;
    clear: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            isOpen: false,
            popup: { isOpen: false },
            setIsOpen: (isOpen) => set({ isOpen }),
            showPopup: (data) => set({ popup: { isOpen: true, ...data } }),
            hidePopup: () => set({ popup: { isOpen: false } }),
            add: (item) => set(state => {
                const existing = state.items.find(i => i.product_id === item.product_id);
                if (existing) {
                    return {
                        items: state.items.map(i =>
                            i.product_id === item.product_id
                                ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                                : i
                        )
                    };
                }
                return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] };
            }),
            remove: (product_id) => set(state => ({
                items: state.items.filter(i => i.product_id !== product_id)
            })),
            updateQty: (product_id, quantity) => set(state => ({
                items: quantity <= 0
                    ? state.items.filter(i => i.product_id !== product_id)
                    : state.items.map(i => i.product_id === product_id ? { ...i, quantity } : i)
            })),
            clear: () => set({ items: [] }),
        }),
        { 
            name: 'guruz-cart',
            partialize: (state) => ({ items: state.items }),
        }
    )
);
