import { create } from 'zustand';

interface WishlistPopupData {
    isOpen: boolean;
    productName?: string;
    productImage?: string;
    action?: 'added' | 'removed';
}

interface WishlistState {
    wishlistIds: number[];
    isInitialized: boolean;
    popup: WishlistPopupData;
    setWishlistIds: (ids: number[]) => void;
    initWishlist: (ids: number[]) => void;
    addWishlistId: (id: number) => void;
    removeWishlistId: (id: number) => void;
    toggleWishlistId: (id: number) => boolean; // returns isAdded
    isFavorite: (id: number) => boolean;
    showPopup: (data: { productName: string; productImage?: string; action: 'added' | 'removed' }) => void;
    hidePopup: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlistIds: [],
    isInitialized: false,
    popup: { isOpen: false },

    setWishlistIds: (ids) => set({ 
        wishlistIds: Array.from(new Set((ids || []).map(Number).filter(n => !isNaN(n) && n > 0))), 
        isInitialized: true 
    }),

    initWishlist: (ids) => {
        if (!get().isInitialized) {
            set({ 
                wishlistIds: Array.from(new Set((ids || []).map(Number).filter(n => !isNaN(n) && n > 0))), 
                isInitialized: true 
            });
        }
    },

    addWishlistId: (id) => {
        const numId = Number(id);
        if (isNaN(numId) || numId <= 0) return;
        set((state) => ({ 
            wishlistIds: Array.from(new Set([...state.wishlistIds, numId])),
            isInitialized: true,
        }));
    },

    removeWishlistId: (id) => {
        const numId = Number(id);
        set((state) => ({ 
            wishlistIds: state.wishlistIds.filter((i) => Number(i) !== numId),
            isInitialized: true,
        }));
    },

    toggleWishlistId: (id) => {
        const numId = Number(id);
        if (isNaN(numId) || numId <= 0) return false;
        const current = get().wishlistIds.map(Number);
        const exists = current.includes(numId);
        if (exists) {
            set({ 
                wishlistIds: current.filter((i) => i !== numId),
                isInitialized: true,
            });
            return false;
        } else {
            set({ 
                wishlistIds: Array.from(new Set([...current, numId])),
                isInitialized: true,
            });
            return true;
        }
    },

    isFavorite: (id) => {
        const numId = Number(id);
        return get().wishlistIds.map(Number).includes(numId);
    },

    showPopup: (data) => set({ popup: { isOpen: true, ...data } }),
    hidePopup: () => set({ popup: { isOpen: false } }),
}));
