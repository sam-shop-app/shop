import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  totalAmount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) =>
          i.id === item.id &&
          i.selectedSize === item.selectedSize &&
          i.selectedColor === item.selectedColor
        );

        if (existingItem) {
          // Update quantity of existing item
          return {
            items: state.items.map((i) =>
              i === existingItem
                ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
                : i
            ),
          };
        }

        // Add new item
        return {
          items: [...state.items, { ...item, quantity: 1 }],
        };
      }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.min(Math.max(0, quantity), item.stock) }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),

      itemCount: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      totalAmount: () => {
        const items = get().items;
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage',
      // Skip persisting functions
      partialize: (state) => ({ items: state.items }),
    }
  )
);
