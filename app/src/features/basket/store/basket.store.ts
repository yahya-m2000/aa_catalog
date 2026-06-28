import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BasketItem } from '@/types/basket';

function basketItemKey(item: Pick<BasketItem, 'productId' | 'selectedSku'>): string {
  return `${item.productId}::${item.selectedSku?.skuId ?? ''}`;
}

interface BasketState {
  items: BasketItem[];
  addItem: (item: BasketItem) => void;
  updateQuantity: (productId: string, skuId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, skuId: string | undefined) => void;
  clearBasket: () => void;
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) =>
        set((state) => {
          const newKey = basketItemKey(newItem);
          const existingIndex = state.items.findIndex((item) => basketItemKey(item) === newKey);

          if (existingIndex === -1) {
            return { items: [...state.items, newItem] };
          }

          const updated = [...state.items];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + newItem.quantity,
          };
          return { items: updated };
        }),
      updateQuantity: (productId, skuId, quantity) =>
        set((state) => {
          const targetKey = basketItemKey({ productId, selectedSku: skuId ? { skuId, options: [] } : undefined });
          if (quantity <= 0) {
            return { items: state.items.filter((item) => basketItemKey(item) !== targetKey) };
          }
          return {
            items: state.items.map((item) => (basketItemKey(item) === targetKey ? { ...item, quantity } : item)),
          };
        }),
      removeItem: (productId, skuId) =>
        set((state) => {
          const targetKey = basketItemKey({ productId, selectedSku: skuId ? { skuId, options: [] } : undefined });
          return { items: state.items.filter((item) => basketItemKey(item) !== targetKey) };
        }),
      clearBasket: () => set({ items: [] }),
    }),
    {
      name: 'basket',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
