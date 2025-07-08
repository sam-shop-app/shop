import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,

      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find((i) => i.id === item.id);

        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + 1, item.stock);
          return get().updateQuantity(item.id, newQuantity);
        }

        const newItems = [...items, { ...item, quantity: 1 }];
        set({
          items: newItems,
          totalItems: get().totalItems + 1,
          totalAmount: get().totalAmount + item.price,
        });
      },

      removeItem: (itemId) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        set({
          items: items.filter((i) => i.id !== itemId),
          totalItems: get().totalItems - item.quantity,
          totalAmount: get().totalAmount - (item.price * item.quantity),
        });
      },

      updateQuantity: (itemId, quantity) => {
        const { items } = get();
        const item = items.find((i) => i.id === itemId);
        if (!item) return;

        const validQuantity = Math.max(0, Math.min(quantity, item.stock));
        const quantityDiff = validQuantity - item.quantity;

        if (validQuantity === 0) {
          return get().removeItem(itemId);
        }

        set({
          items: items.map((i) =>
            i.id === itemId ? { ...i, quantity: validQuantity } : i
          ),
          totalItems: get().totalItems + quantityDiff,
          totalAmount: get().totalAmount + (item.price * quantityDiff),
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
