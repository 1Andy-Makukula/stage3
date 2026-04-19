// Wishlist Management Hook

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../types';
import { newIdempotencyKey, postJson } from '../lib/api';

interface WishlistState {
  items: Product[];
  isPublic: boolean;

  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  /** Optimistic toggle with server reconciliation; rolls back on failure. */
  toggleWishlistOptimistic: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleVisibility: () => void;
  clearWishlist: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isPublic: false,

      addToWishlist: (product: Product) => {
        const { items } = get();
        if (!items.find(item => item.id === product.id)) {
          set({ items: [...items, product] });
        }
      },

      removeFromWishlist: (productId: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== productId),
        }));
      },

      toggleWishlistOptimistic: async (product: Product) => {
        const wasIn = get().isInWishlist(product.id);
        const previous = get().items.map((p) => ({ ...p }));
        if (wasIn) {
          get().removeFromWishlist(product.id);
        } else {
          get().addToWishlist(product);
        }
        try {
          const { ok, status } = await postJson<{ error?: string }>(
            '/api/wishlist/toggle',
            { productId: product.id, inWishlist: !wasIn },
            { 'Idempotency-Key': newIdempotencyKey() }
          );
          if (!ok && status >= 500) {
            throw new Error('sync_failed');
          }
        } catch {
          set({ items: previous });
          throw new Error('WISHLIST_SYNC_FAILED');
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some(item => item.id === productId);
      },

      toggleVisibility: () => {
        set(state => ({ isPublic: !state.isPublic }));
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'kithly-wishlist',
    }
  )
);
